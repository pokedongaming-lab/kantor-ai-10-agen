"""
gen_detailed_agents.py — Blender 4.2 LTS headless script.
Generates 10 high-fidelity 3D characters matching user-supplied reference images:
  1. kasir_dina     -> Mint bear-hoodie creature with heterochromia (yellow/blue eyes), buck teeth, pink tummy/paws
  2. pesanan_rina   -> Anime cat-girl with lavender/blue hair, cat ears, split sky-blue/pink hoodie
  3. manajer_ratna  -> Chubby leader with flowing wavy pastel rainbow/blue hair, split pastel loungewear
  4. laporan_doni   -> Steel-blue anime hair, golden eyes, pink hoodie with drawstrings, mint pants, purple sneakers
  5. desain_lita    -> Mint cat-eared hoodie, lavender bangs, blue blush face, pink pleated skirt, yellow leggings
  6. cs_fajar       -> Smooth pear-shaped rainbow marshmallow creature with big glossy eyes and rosy cheeks
  7. stok_bayu      -> Fluffy rainbow kitten with fluffy cat ears, white cheeks & chest, big violet eyes, cute tail
  8. riset_raka     -> Tech anime boy, two-tone brunette & caramel parted hair, earring, maroon hoodie, backpack
  9. konten_sekar   -> Chibi girl scriptwriter with lavender hair, cat clips, cropped jacket, pleated skirt
 10. keuangan_sari  -> Chic strategist with rose bob, golden data visor, coral blazer, mint pants, ledger tablet

Every character gets:
  - Armature with 19 bones: Root, Hips, Spine, Neck, Head, bilateral Shoulders, Arms, Forearms, Hands, Thighs, Shins, Feet
  - Automatic envelope skin weights
  - 7 Actions: Idle, Walk, Sit, Type, Talk, Think, Celebrate
  - Exported to public/models/agents/{agent_key}_{slug}.glb
"""

import bpy
import math
import os
import sys
import traceback

OUTPUT_DIR = r"c:\Users\admin\kantor-ai-10-agen\public\models\agents"
os.makedirs(OUTPUT_DIR, exist_ok=True)
R = math.radians

# ─────────────────────── MATERIAL HELPERS ───────────────────────

def hex_to_rgba(hex_str, alpha=1.0):
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 6:
        r = int(hex_str[0:2], 16) / 255.0
        g = int(hex_str[2:4], 16) / 255.0
        b = int(hex_str[4:6], 16) / 255.0
        return (r, g, b, alpha)
    return (1.0, 1.0, 1.0, alpha)

def make_mat(name, hex_color, roughness=0.45, metallic=0.05, emissive_hex=None, emissive_int=0.2):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    
    rgba = hex_to_rgba(hex_color) if isinstance(hex_color, str) else hex_color
    bsdf.inputs["Base Color"].default_value = rgba
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    
    # Emissive glow for pastel readability
    em_color = hex_to_rgba(emissive_hex) if emissive_hex else rgba
    bsdf.inputs["Emission Color"].default_value = em_color
    bsdf.inputs["Emission Strength"].default_value = emissive_int

    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat

MAT_WHITE    = None
MAT_BLACK    = None
MAT_SKIN     = None
MAT_BLUSH    = None
MAT_GOLD_EYE = None
MAT_BLUE_EYE = None
MAT_BROWN_EYE= None
MAT_VIOLET_EYE=None
MAT_PINK_NOSE= None
MAT_GOLD_MET = None
MAT_SILVER   = None

def init_common_materials():
    global MAT_WHITE, MAT_BLACK, MAT_SKIN, MAT_BLUSH, MAT_GOLD_EYE, MAT_BLUE_EYE
    global MAT_BROWN_EYE, MAT_VIOLET_EYE, MAT_PINK_NOSE, MAT_GOLD_MET, MAT_SILVER
    MAT_WHITE    = make_mat("M_White", "#FFFFFF", roughness=0.2, emissive_int=0.3)
    MAT_BLACK    = make_mat("M_Black", "#151518", roughness=0.1, emissive_int=0.0)
    MAT_SKIN     = make_mat("M_Skin", "#FFF0E5", roughness=0.4, emissive_int=0.15)
    MAT_BLUSH    = make_mat("M_Blush", "#FFA5B8", roughness=0.6, emissive_int=0.25)
    MAT_GOLD_EYE = make_mat("M_GoldEye", "#F5C542", roughness=0.1, emissive_int=0.4)
    MAT_BLUE_EYE = make_mat("M_BlueEye", "#4EA8DE", roughness=0.1, emissive_int=0.4)
    MAT_BROWN_EYE= make_mat("M_BrownEye", "#5A3825", roughness=0.1, emissive_int=0.2)
    MAT_VIOLET_EYE=make_mat("M_VioletEye","#8B5CF6", roughness=0.1, emissive_int=0.4)
    MAT_PINK_NOSE= make_mat("M_PinkNose", "#F472B6", roughness=0.3, emissive_int=0.3)
    MAT_GOLD_MET = make_mat("M_GoldMet", "#FBBF24", roughness=0.2, metallic=0.7, emissive_int=0.3)
    MAT_SILVER   = make_mat("M_Silver", "#E2E8F0", roughness=0.2, metallic=0.8, emissive_int=0.2)

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    init_common_materials()

# ─────────────────────── GEOMETRY HELPERS ───────────────────────

def add_sphere(name, loc, r, scale=(1, 1, 1), rot=(0, 0, 0), mat=None, segments=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=max(8, segments // 2), radius=r, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    obj.rotation_euler = rot
    bpy.ops.object.shade_smooth()
    if mat:
        obj.data.materials.append(mat)
    return obj

def add_cylinder(name, loc, r, depth, scale=(1, 1, 1), rot=(0, 0, 0), mat=None, vertices=16):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=r, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.shade_smooth()
    if mat:
        obj.data.materials.append(mat)
    return obj

def add_cube(name, loc, size, scale=(1, 1, 1), rot=(0, 0, 0), mat=None):
    bpy.ops.mesh.primitive_cube_add(size=size, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.shade_smooth()
    if mat:
        obj.data.materials.append(mat)
    return obj

def add_cone(name, loc, r, depth, scale=(1, 1, 1), rot=(0, 0, 0), mat=None, vertices=16):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=r, radius2=0, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.shade_smooth()
    if mat:
        obj.data.materials.append(mat)
    return obj

def add_torus(name, loc, r_major, r_minor, scale=(1, 1, 1), rot=(0, 0, 0), mat=None):
    bpy.ops.mesh.primitive_torus_add(major_radius=r_major, minor_radius=r_minor, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.shade_smooth()
    if mat:
        obj.data.materials.append(mat)
    return obj

def add_stylized_eye(prefix, loc, r=0.08, iris_mat=None, is_left=True):
    if iris_mat is None:
        iris_mat = MAT_BROWN_EYE
    parts = []
    # Sclera (white eye base)
    sclera = add_sphere(f"{prefix}_sclera", loc, r, scale=(1.0, 0.45, 1.1), mat=MAT_WHITE)
    parts.append(sclera)
    
    # Iris
    iris_loc = (loc[0], loc[1] + r * 0.35, loc[2])
    iris = add_sphere(f"{prefix}_iris", iris_loc, r * 0.72, scale=(0.95, 0.3, 0.95), mat=iris_mat)
    parts.append(iris)
    
    # Pupil
    pupil_loc = (loc[0], loc[1] + r * 0.42, loc[2])
    pupil = add_sphere(f"{prefix}_pupil", pupil_loc, r * 0.42, scale=(0.85, 0.25, 0.85), mat=MAT_BLACK)
    parts.append(pupil)
    
    # Highlight shine
    hl_off_x = -0.015 if is_left else 0.015
    hl_loc = (loc[0] + hl_off_x, loc[1] + r * 0.45, loc[2] + 0.02)
    hl = add_sphere(f"{prefix}_hl", hl_loc, r * 0.22, scale=(0.7, 0.2, 0.7), mat=MAT_WHITE)
    parts.append(hl)
    return parts

# ─────────────────────── 10 CHARACTER BUILDERS ───────────────────────

def build_kasir_dina():
    """Agent 1: Mint bear-hoodie creature with heterochromia (yellow/blue eyes), buck teeth, pink tummy/arms (Reference Image 1)"""
    parts = []
    M_MINT = make_mat("Dina_Mint", "#7EDCC2")
    M_PINK = make_mat("Dina_Pink", "#F49DB0")
    M_CYAN = make_mat("Dina_Cyan", "#88D7EE")
    M_IVORY= make_mat("Dina_Ivory", "#FFF5E8")

    # Hood (Mint round sphere framing head)
    hood = add_sphere("dina_hood", (0, 0, 1.25), 0.36, scale=(1.05, 1.02, 1.02), mat=M_MINT)
    parts.append(hood)

    # Face inside hood
    face = add_sphere("dina_face", (0, 0.08, 1.25), 0.29, scale=(0.95, 0.8, 0.95), mat=M_IVORY)
    parts.append(face)

    # Round Bear/Bunny Ears on top of hood
    ear_L = add_sphere("dina_earL", (-0.18, 0, 1.56), 0.11, scale=(0.9, 0.8, 1.2), rot=(0, R(-15), 0), mat=M_MINT)
    ear_R = add_sphere("dina_earR", (0.18, 0, 1.56), 0.11, scale=(0.9, 0.8, 1.2), rot=(0, R(15), 0), mat=M_MINT)
    parts.extend([ear_L, ear_R])

    # Side ear flaps / cheeks
    flap_L = add_sphere("dina_flapL", (-0.32, 0.02, 1.26), 0.11, scale=(0.7, 0.8, 1.2), rot=(R(10), 0, R(20)), mat=M_MINT)
    flap_R = add_sphere("dina_flapR", (0.32, 0.02, 1.26), 0.11, scale=(0.7, 0.8, 1.2), rot=(R(10), 0, R(-20)), mat=M_MINT)
    parts.extend([flap_L, flap_R])

    # Heterochromia Eyes (Left: Warm Amber/Yellow, Right: Sky Blue)
    parts.extend(add_stylized_eye("dina_eyeL", (-0.11, 0.28, 1.28), r=0.065, iris_mat=MAT_GOLD_EYE, is_left=True))
    parts.extend(add_stylized_eye("dina_eyeR", (0.11, 0.28, 1.28), r=0.065, iris_mat=MAT_BLUE_EYE, is_left=False))

    # Cute pink button nose
    nose = add_sphere("dina_nose", (0, 0.32, 1.23), 0.038, scale=(1.2, 0.8, 0.9), mat=MAT_PINK_NOSE)
    parts.append(nose)

    # Pink cheeks blush
    blush_L = add_sphere("dina_blushL", (-0.18, 0.24, 1.20), 0.055, scale=(1.2, 0.3, 0.8), mat=MAT_BLUSH)
    blush_R = add_sphere("dina_blushR", (0.18, 0.24, 1.20), 0.055, scale=(1.2, 0.3, 0.8), mat=MAT_BLUSH)
    parts.extend([blush_L, blush_R])

    # Open smiling mouth with 2 buck teeth
    mouth_bg = add_sphere("dina_mouth", (0, 0.30, 1.15), 0.048, scale=(1.2, 0.4, 0.7), mat=make_mat("Dina_Mouth", "#7A2035"))
    tooth_L  = add_cube("dina_toothL", (-0.016, 0.33, 1.17), 0.022, scale=(0.9, 0.3, 1.0), mat=MAT_WHITE)
    tooth_R  = add_cube("dina_toothR", (0.016, 0.33, 1.17), 0.022, scale=(0.9, 0.3, 1.0), mat=MAT_WHITE)
    parts.extend([mouth_bg, tooth_L, tooth_R])

    # Body (Mint onesie with cyan tummy)
    body = add_cylinder("dina_body", (0, 0, 0.76), 0.24, 0.44, scale=(1.05, 0.95, 1.0), mat=M_MINT)
    tummy = add_sphere("dina_tummy", (0, 0.12, 0.74), 0.21, scale=(0.85, 0.45, 1.1), mat=M_CYAN)
    parts.extend([body, tummy])

    # Pink arms with mint paws
    arm_L = add_cylinder("dina_armL", (-0.32, 0, 0.80), 0.08, 0.30, rot=(0, R(25), 0), mat=M_PINK)
    arm_R = add_cylinder("dina_armR", (0.32, 0, 0.80), 0.08, 0.30, rot=(0, R(-25), 0), mat=M_PINK)
    paw_L = add_sphere("dina_pawL", (-0.44, 0, 0.65), 0.08, mat=M_MINT)
    paw_R = add_sphere("dina_pawR", (0.44, 0, 0.65), 0.08, mat=M_MINT)
    parts.extend([arm_L, arm_R, paw_L, paw_R])

    # Pink legs with mint feet pads
    leg_L = add_cylinder("dina_legL", (-0.14, 0, 0.32), 0.10, 0.32, mat=M_PINK)
    leg_R = add_cylinder("dina_legR", (0.14, 0, 0.32), 0.10, 0.32, mat=M_PINK)
    foot_L = add_cylinder("dina_footL", (-0.14, 0.05, 0.08), 0.105, 0.14, rot=(R(90), 0, 0), mat=M_MINT)
    foot_R = add_cylinder("dina_footR", (0.14, 0.05, 0.08), 0.105, 0.14, rot=(R(90), 0, 0), mat=M_MINT)
    parts.extend([leg_L, leg_R, foot_L, foot_R])

    return parts

def build_pesanan_rina():
    """Agent 2: Anime cat-girl with lavender/blue hair, cat ears, split sky-blue/pink hoodie (Reference Image 2)"""
    parts = []
    M_HAIR_LAV = make_mat("Rina_HairLav", "#B8A6E8")
    M_HAIR_BLU = make_mat("Rina_HairBlu", "#9AC8EB")
    M_HOOD_BLU = make_mat("Rina_HoodBlu", "#74B8E8")
    M_HOOD_PNK = make_mat("Rina_HoodPnk", "#F1A8C8")
    M_PANTS_LAV= make_mat("Rina_PantsLav", "#A79BE0")

    # Head & Face
    head = add_sphere("rina_head", (0, 0, 1.25), 0.28, scale=(1.0, 0.95, 1.02), mat=MAT_SKIN)
    parts.append(head)

    # Cat ears on head with pink inner ear
    ear_L = add_cone("rina_earL", (-0.18, -0.02, 1.54), 0.09, 0.18, rot=(R(10), R(-15), 0), mat=M_HAIR_BLU)
    ear_R = add_cone("rina_earR", (0.18, -0.02, 1.54), 0.09, 0.18, rot=(R(10), R(15), 0), mat=M_HAIR_LAV)
    inner_L = add_cone("rina_innerL", (-0.18, 0.01, 1.54), 0.055, 0.14, rot=(R(10), R(-15), 0), mat=MAT_BLUSH)
    inner_R = add_cone("rina_innerR", (0.18, 0.01, 1.54), 0.055, 0.14, rot=(R(10), R(15), 0), mat=MAT_BLUSH)
    parts.extend([ear_L, ear_R, inner_L, inner_R])

    # Layered anime bangs (two-tone lavender and baby blue)
    bang_L = add_sphere("rina_bangL", (-0.12, 0.20, 1.35), 0.14, scale=(0.9, 0.4, 1.2), rot=(R(20), 0, R(15)), mat=M_HAIR_BLU)
    bang_R = add_sphere("rina_bangR", (0.12, 0.20, 1.35), 0.14, scale=(0.9, 0.4, 1.2), rot=(R(20), 0, R(-15)), mat=M_HAIR_LAV)
    hair_back = add_sphere("rina_hairBack", (0, -0.12, 1.22), 0.31, scale=(1.05, 0.9, 1.2), mat=M_HAIR_LAV)
    parts.extend([bang_L, bang_R, hair_back])

    # Eyes & Cute Cat Nose
    parts.extend(add_stylized_eye("rina_eyeL", (-0.10, 0.22, 1.26), r=0.062, iris_mat=MAT_BROWN_EYE, is_left=True))
    parts.extend(add_stylized_eye("rina_eyeR", (0.10, 0.22, 1.26), r=0.062, iris_mat=MAT_BROWN_EYE, is_left=False))
    nose = add_cone("rina_nose", (0, 0.27, 1.20), 0.025, 0.02, rot=(R(90), 0, 0), mat=MAT_PINK_NOSE)
    mouth = add_torus("rina_mouth", (0, 0.26, 1.14), 0.028, 0.007, rot=(R(90), 0, 0), mat=make_mat("Rina_Lip", "#E14B68"))
    parts.extend([nose, mouth])

    # Split Hoodie (Sky-Blue on Right arm/side, Pink on Left)
    hoodie_L = add_cube("rina_hoodL", (-0.11, 0, 0.78), 0.22, scale=(1.0, 0.85, 1.8), mat=M_HOOD_BLU)
    hoodie_R = add_cube("rina_hoodR", (0.11, 0, 0.78), 0.22, scale=(1.0, 0.85, 1.8), mat=M_HOOD_PNK)
    pouch = add_cube("rina_pouch", (0, 0.11, 0.68), 0.14, scale=(1.2, 0.4, 0.8), mat=M_HOOD_BLU)
    parts.extend([hoodie_L, hoodie_R, pouch])

    # Split Arms (Blue & Pink) + Hands
    arm_L = add_cylinder("rina_armL", (-0.30, 0.05, 0.82), 0.065, 0.32, rot=(R(-15), R(30), 0), mat=M_HOOD_BLU)
    arm_R = add_cylinder("rina_armR", (0.30, 0.05, 0.82), 0.065, 0.32, rot=(R(-15), R(-30), 0), mat=M_HOOD_PNK)
    hand_L = add_sphere("rina_handL", (-0.42, 0.16, 0.70), 0.055, mat=MAT_SKIN)
    hand_R = add_sphere("rina_handR", (0.42, 0.16, 0.70), 0.055, mat=MAT_SKIN)
    parts.extend([arm_L, arm_R, hand_L, hand_R])

    # Split Jogger Pants & Shoes
    leg_L = add_cylinder("rina_legL", (-0.11, 0, 0.34), 0.08, 0.34, mat=M_HOOD_BLU)
    leg_R = add_cylinder("rina_legR", (0.11, 0, 0.34), 0.08, 0.34, mat=M_PANTS_LAV)
    shoe_L = add_cylinder("rina_shoeL", (-0.11, 0.04, 0.08), 0.085, 0.16, rot=(R(90), 0, 0), mat=M_HOOD_BLU)
    shoe_R = add_cylinder("rina_shoeR", (0.11, 0.04, 0.08), 0.085, 0.16, rot=(R(90), 0, 0), mat=M_HOOD_PNK)
    parts.extend([leg_L, leg_R, shoe_L, shoe_R])

    return parts

def build_manajer_ratna():
    """Agent 3: Mature chubby leader with flowing wavy pastel rainbow/blue hair, split pastel loungewear (Reference Image 3)"""
    parts = []
    M_HAIR_WAVE = make_mat("Ratna_HairWave", "#96CDE6")
    M_HAIR_OMBR = make_mat("Ratna_HairOmbre", "#D4BBEE")
    M_TOP_LILAC = make_mat("Ratna_TopLilac", "#B5A7DC")
    M_TOP_MINT  = make_mat("Ratna_TopMint", "#9CE3D0")
    M_COLLAR    = make_mat("Ratna_Collar", "#F7C5D4")
    M_PANTS_PNK = make_mat("Ratna_PantsPnk", "#F5B4C8")

    # Round, happy mature face
    head = add_sphere("ratna_head", (0, 0, 1.25), 0.32, scale=(1.05, 0.95, 1.0), mat=MAT_SKIN)
    parts.append(head)

    # Voluminous wavy hair draped on shoulders
    hair_top = add_sphere("ratna_hairTop", (0, -0.06, 1.38), 0.34, scale=(1.12, 1.05, 0.95), mat=M_HAIR_WAVE)
    wave_L = add_cylinder("ratna_waveL", (-0.28, -0.02, 1.15), 0.12, 0.44, rot=(0, R(15), R(-10)), mat=M_HAIR_OMBR)
    wave_R = add_cylinder("ratna_waveR", (0.28, -0.02, 1.15), 0.12, 0.44, rot=(0, R(-15), R(10)), mat=M_HAIR_OMBR)
    parts.extend([hair_top, wave_L, wave_R])

    # Expressive Navy/Blue anime eyes & joyful smile
    parts.extend(add_stylized_eye("ratna_eyeL", (-0.12, 0.26, 1.28), r=0.07, iris_mat=MAT_BLUE_EYE, is_left=True))
    parts.extend(add_stylized_eye("ratna_eyeR", (0.12, 0.26, 1.28), r=0.07, iris_mat=MAT_BLUE_EYE, is_left=False))
    blush_L = add_sphere("ratna_blushL", (-0.19, 0.23, 1.20), 0.06, scale=(1.1, 0.3, 0.7), mat=MAT_BLUSH)
    blush_R = add_sphere("ratna_blushR", (0.19, 0.23, 1.20), 0.06, scale=(1.1, 0.3, 0.7), mat=MAT_BLUSH)
    mouth = add_torus("ratna_mouth", (0, 0.29, 1.14), 0.042, 0.012, rot=(R(90), 0, 0), mat=make_mat("Ratna_Lip", "#D84A6A"))
    parts.extend([blush_L, blush_R, mouth])

    # Chubby comfortable loungewear body (Split Lilac & Mint with Pink trim)
    body_L = add_cylinder("ratna_bodyL", (-0.12, 0, 0.74), 0.17, 0.46, scale=(1.05, 0.9, 1.0), mat=M_TOP_LILAC)
    body_R = add_cylinder("ratna_bodyR", (0.12, 0, 0.74), 0.17, 0.46, scale=(1.05, 0.9, 1.0), mat=M_TOP_MINT)
    collar = add_torus("ratna_collar", (0, 0.08, 0.96), 0.16, 0.03, rot=(R(30), 0, 0), mat=M_COLLAR)
    parts.extend([body_L, body_R, collar])

    # Curved warm arms & waving hand
    arm_L = add_cylinder("ratna_armL", (-0.34, 0.08, 0.82), 0.085, 0.30, rot=(R(-30), R(40), 0), mat=M_TOP_LILAC)
    arm_R = add_cylinder("ratna_armR", (0.34, 0.02, 0.80), 0.085, 0.30, rot=(0, R(-20), 0), mat=M_TOP_MINT)
    hand_L = add_sphere("ratna_handL", (-0.46, 0.22, 0.76), 0.065, mat=MAT_SKIN)
    hand_R = add_sphere("ratna_handR", (0.44, 0.02, 0.64), 0.065, mat=MAT_SKIN)
    parts.extend([arm_L, arm_R, hand_L, hand_R])

    # Split loungewear pants (Mint & Pink)
    leg_L = add_cylinder("ratna_legL", (-0.14, 0, 0.32), 0.11, 0.32, mat=M_TOP_MINT)
    leg_R = add_cylinder("ratna_legR", (0.14, 0, 0.32), 0.11, 0.32, mat=M_PANTS_PNK)
    foot_L = add_sphere("ratna_footL", (-0.14, 0.05, 0.08), 0.08, scale=(1.0, 1.4, 0.7), mat=MAT_SKIN)
    foot_R = add_sphere("ratna_footR", (0.14, 0.05, 0.08), 0.08, scale=(1.0, 1.4, 0.7), mat=MAT_SKIN)
    parts.extend([leg_L, leg_R, foot_L, foot_R])

    return parts

def build_laporan_doni():
    """Agent 4: Steel-blue anime hair, golden eyes, pink hoodie with drawstrings, mint pants, purple sneakers (Reference Image 4)"""
    parts = []
    M_HAIR_BLU  = make_mat("Doni_HairBlu", "#7CA2C8")
    M_HOOD_PNK  = make_mat("Doni_HoodPnk", "#F4A3B6")
    M_PANTS_MNT = make_mat("Doni_PantsMnt", "#7BD4B0")
    M_SNEAK_PRP = make_mat("Doni_SneakPrp", "#9A73D8")
    M_CYBER     = make_mat("Doni_Cyber", "#DB2777", emissive_int=0.5)

    # Head
    head = add_sphere("doni_head", (0, 0, 1.25), 0.27, scale=(0.98, 0.95, 1.02), mat=MAT_SKIN)
    parts.append(head)

    # Layered steel-blue swept anime hairstyle
    hair_top = add_sphere("doni_hairTop", (0, -0.04, 1.34), 0.30, scale=(1.05, 1.0, 1.05), mat=M_HAIR_BLU)
    bang_sweep = add_cone("doni_bang", (-0.08, 0.22, 1.32), 0.12, 0.24, rot=(R(-15), R(-40), R(20)), mat=M_HAIR_BLU)
    parts.extend([hair_top, bang_sweep])

    # Golden/Amber anime eyes & confident smile
    parts.extend(add_stylized_eye("doni_eyeL", (-0.09, 0.22, 1.26), r=0.06, iris_mat=MAT_GOLD_EYE, is_left=True))
    parts.extend(add_stylized_eye("doni_eyeR", (0.09, 0.22, 1.26), r=0.06, iris_mat=MAT_GOLD_EYE, is_left=False))
    mouth = add_torus("doni_mouth", (0, 0.25, 1.15), 0.03, 0.008, rot=(R(90), 0, 0), mat=make_mat("Doni_Lip", "#C03952"))
    parts.append(mouth)

    # Cybernetic muscle neck line
    cyber_neck = add_torus("doni_cyber", (0, 0.04, 1.06), 0.11, 0.015, mat=M_CYBER)
    parts.append(cyber_neck)

    # Pink pullover hoodie with kangaroo pouch & white drawstrings
    hoodie = add_cylinder("doni_body", (0, 0, 0.76), 0.22, 0.46, mat=M_HOOD_PNK)
    pouch  = add_cube("doni_pouch", (0, 0.13, 0.68), 0.15, scale=(1.2, 0.4, 0.7), mat=M_HOOD_PNK)
    string_L = add_cylinder("doni_strL", (-0.04, 0.15, 0.88), 0.008, 0.18, mat=MAT_WHITE)
    string_R = add_cylinder("doni_strR", (0.04, 0.15, 0.88), 0.008, 0.18, mat=MAT_WHITE)
    parts.extend([hoodie, pouch, string_L, string_R])

    # Athletic Arms & Waving Hand
    arm_L = add_cylinder("doni_armL", (-0.32, 0.06, 0.84), 0.07, 0.32, rot=(R(-25), R(35), 0), mat=M_HOOD_PNK)
    arm_R = add_cylinder("doni_armR", (0.30, -0.02, 0.78), 0.07, 0.30, rot=(0, R(-15), 0), mat=M_HOOD_PNK)
    hand_L = add_sphere("doni_handL", (-0.44, 0.18, 0.72), 0.06, mat=MAT_SKIN)
    hand_R = add_sphere("doni_handR", (0.38, -0.02, 0.62), 0.06, mat=MAT_SKIN)
    parts.extend([arm_L, arm_R, hand_L, hand_R])

    # Mint green cropped joggers & purple sneakers
    leg_L = add_cylinder("doni_legL", (-0.12, 0, 0.34), 0.085, 0.34, mat=M_PANTS_MNT)
    leg_R = add_cylinder("doni_legR", (0.12, 0, 0.34), 0.085, 0.34, mat=M_PANTS_MNT)
    shoe_L = add_cube("doni_shoeL", (-0.12, 0.05, 0.08), 0.11, scale=(0.9, 1.6, 0.8), mat=M_SNEAK_PRP)
    shoe_R = add_cube("doni_shoeR", (0.12, 0.05, 0.08), 0.11, scale=(0.9, 1.6, 0.8), mat=M_SNEAK_PRP)
    parts.extend([leg_L, leg_R, shoe_L, shoe_R])

    return parts

def build_desain_lita():
    """Agent 5: Mint cat-eared hoodie, lavender bangs, blue blush face, pink pleated skirt, yellow leggings (Reference Image 5)"""
    parts = []
    M_MINT_HOOD = make_mat("Lita_MintHood", "#8FE0C8")
    M_LAV_HAIR  = make_mat("Lita_LavHair", "#BCA9E8")
    M_SKIRT_PNK = make_mat("Lita_SkirtPnk", "#F5A7BE")
    M_LEGG_YEL  = make_mat("Lita_LeggYel", "#FDF1A9")

    # Mint Hood framing face
    hood = add_sphere("lita_hood", (0, 0, 1.25), 0.34, scale=(1.02, 1.0, 1.05), mat=M_MINT_HOOD)
    face = add_sphere("lita_face", (0, 0.08, 1.24), 0.27, scale=(0.96, 0.8, 0.98), mat=MAT_SKIN)
    parts.extend([hood, face])

    # Cat ears on top of hood
    ear_L = add_cone("lita_earL", (-0.16, 0, 1.54), 0.09, 0.16, rot=(0, R(-15), 0), mat=M_MINT_HOOD)
    ear_R = add_cone("lita_earR", (0.16, 0, 1.54), 0.09, 0.16, rot=(0, R(15), 0), mat=M_MINT_HOOD)
    parts.extend([ear_L, ear_R])

    # Lavender fringe/bangs peeking from hood
    bangs = add_sphere("lita_bangs", (0, 0.22, 1.34), 0.18, scale=(1.1, 0.4, 0.6), mat=M_LAV_HAIR)
    parts.append(bangs)

    # Big anime eyes with blue-purple tint
    parts.extend(add_stylized_eye("lita_eyeL", (-0.10, 0.26, 1.25), r=0.065, iris_mat=MAT_VIOLET_EYE, is_left=True))
    parts.extend(add_stylized_eye("lita_eyeR", (0.10, 0.26, 1.25), r=0.065, iris_mat=MAT_VIOLET_EYE, is_left=False))
    blush_L = add_sphere("lita_blushL", (-0.16, 0.24, 1.18), 0.05, scale=(1.2, 0.3, 0.7), mat=MAT_BLUSH)
    blush_R = add_sphere("lita_blushR", (0.16, 0.24, 1.18), 0.05, scale=(1.2, 0.3, 0.7), mat=MAT_BLUSH)
    parts.extend([blush_L, blush_R])

    # Oversized Mint Hoodie with pocket
    body = add_cylinder("lita_body", (0, 0, 0.82), 0.22, 0.40, mat=M_MINT_HOOD)
    pouch = add_cube("lita_pouch", (0, 0.12, 0.74), 0.14, scale=(1.1, 0.4, 0.7), mat=M_MINT_HOOD)
    parts.extend([body, pouch])

    # Pink pleated skirt
    skirt = add_cone("lita_skirt", (0, 0, 0.58), 0.26, 0.18, scale=(1.05, 0.95, 1.0), rot=(R(180), 0, 0), mat=M_SKIRT_PNK)
    parts.append(skirt)

    # Arms in oversized sleeves + hands
    arm_L = add_cylinder("lita_armL", (-0.30, 0.04, 0.84), 0.075, 0.30, rot=(0, R(25), 0), mat=M_MINT_HOOD)
    arm_R = add_cylinder("lita_armR", (0.30, 0.04, 0.84), 0.075, 0.30, rot=(0, R(-25), 0), mat=M_MINT_HOOD)
    hand_L = add_sphere("lita_handL", (-0.42, 0.04, 0.70), 0.05, mat=MAT_SKIN)
    hand_R = add_sphere("lita_handR", (0.42, 0.04, 0.70), 0.05, mat=MAT_SKIN)
    parts.extend([arm_L, arm_R, hand_L, hand_R])

    # Pastel yellow leggings & feet
    leg_L = add_cylinder("lita_legL", (-0.10, 0, 0.30), 0.065, 0.34, mat=M_LEGG_YEL)
    leg_R = add_cylinder("lita_legR", (0.10, 0, 0.30), 0.065, 0.34, mat=M_LEGG_YEL)
    foot_L = add_sphere("lita_footL", (-0.10, 0.03, 0.06), 0.06, scale=(0.9, 1.4, 0.7), mat=MAT_SKIN)
    foot_R = add_sphere("lita_footR", (0.10, 0.03, 0.06), 0.06, scale=(0.9, 1.4, 0.7), mat=MAT_SKIN)
    parts.extend([leg_L, leg_R, foot_L, foot_R])

    return parts

def build_cs_fajar():
    """Agent 6: Smooth pear-shaped rainbow marshmallow creature with big glossy eyes and rosy cheeks (Reference Image 6)"""
    parts = []
    M_RAIN_MNT = make_mat("Fajar_Mnt", "#7EE2CA")
    M_RAIN_YEL = make_mat("Fajar_Yel", "#FDEE9C")
    M_RAIN_PNK = make_mat("Fajar_Pnk", "#F9A4BA")
    M_RAIN_LAV = make_mat("Fajar_Lav", "#BFA9E8")

    # Pear / marshmallow gradient body (seamless rounded cute creature)
    head_part = add_sphere("fajar_head", (0, 0, 1.18), 0.34, scale=(1.05, 0.98, 1.05), mat=M_RAIN_MNT)
    mid_part  = add_sphere("fajar_mid", (0, 0, 0.88), 0.38, scale=(1.08, 1.0, 1.0), mat=M_RAIN_YEL)
    base_part = add_sphere("fajar_base", (0, 0, 0.58), 0.36, scale=(1.05, 0.98, 0.95), mat=M_RAIN_PNK)
    parts.extend([head_part, mid_part, base_part])

    # Big glossy expressive eyes
    parts.extend(add_stylized_eye("fajar_eyeL", (-0.13, 0.28, 1.20), r=0.075, iris_mat=MAT_BROWN_EYE, is_left=True))
    parts.extend(add_stylized_eye("fajar_eyeR", (0.13, 0.28, 1.20), r=0.075, iris_mat=MAT_BROWN_EYE, is_left=False))

    # Cute tiny pink button nose & smile
    nose = add_sphere("fajar_nose", (0, 0.32, 1.13), 0.03, mat=MAT_PINK_NOSE)
    mouth = add_torus("fajar_mouth", (0, 0.30, 1.07), 0.035, 0.008, rot=(R(90), 0, 0), mat=make_mat("Fajar_Smile", "#8A3B50"))
    blush_L = add_sphere("fajar_blushL", (-0.20, 0.24, 1.10), 0.065, scale=(1.2, 0.3, 0.8), mat=MAT_BLUSH)
    blush_R = add_sphere("fajar_blushR", (0.20, 0.24, 1.10), 0.065, scale=(1.2, 0.3, 0.8), mat=MAT_BLUSH)
    parts.extend([nose, mouth, blush_L, blush_R])

    # Chubby cute stubby arms
    arm_L = add_sphere("fajar_armL", (-0.36, 0.05, 0.85), 0.11, scale=(0.8, 0.8, 1.6), rot=(0, R(35), 0), mat=M_RAIN_LAV)
    arm_R = add_sphere("fajar_armR", (0.36, 0.05, 0.85), 0.11, scale=(0.8, 0.8, 1.6), rot=(0, R(-35), 0), mat=M_RAIN_PNK)
    parts.extend([arm_L, arm_R])

    # Chubby stubby legs
    leg_L = add_sphere("fajar_legL", (-0.15, 0, 0.28), 0.12, scale=(0.9, 1.0, 1.8), mat=M_RAIN_MNT)
    leg_R = add_sphere("fajar_legR", (0.15, 0, 0.28), 0.12, scale=(0.9, 1.0, 1.8), mat=M_RAIN_PNK)
    parts.extend([leg_L, leg_R])

    return parts

def build_stok_bayu():
    """Agent 7: Fluffy rainbow kitten with fluffy cat ears, white cheeks & chest, big violet eyes, cute tail (Reference Image 7)"""
    parts = []
    M_FUR_BLU = make_mat("Bayu_FurBlu", "#8ED8F0")
    M_FUR_PNK = make_mat("Bayu_FurPnk", "#F5A8C5")
    M_FUR_YEL = make_mat("Bayu_FurYel", "#FDF2A9")
    M_FUR_WHT = make_mat("Bayu_FurWht", "#FFFFFF", roughness=0.3)

    # Fluffy round kitten head
    head = add_sphere("bayu_head", (0, 0, 1.25), 0.35, scale=(1.08, 1.02, 1.0), mat=M_FUR_BLU)
    parts.append(head)

    # Fluffy cat ears with pink inner ear
    ear_L = add_cone("bayu_earL", (-0.20, 0, 1.60), 0.14, 0.24, rot=(0, R(-18), 0), mat=M_FUR_PNK)
    ear_R = add_cone("bayu_earR", (0.20, 0, 1.60), 0.14, 0.24, rot=(0, R(18), 0), mat=M_FUR_BLU)
    inner_L = add_cone("bayu_innerL", (-0.20, 0.03, 1.60), 0.08, 0.18, rot=(0, R(-18), 0), mat=MAT_BLUSH)
    inner_R = add_cone("bayu_innerR", (0.20, 0.03, 1.60), 0.08, 0.18, rot=(0, R(18), 0), mat=MAT_BLUSH)
    parts.extend([ear_L, ear_R, inner_L, inner_R])

    # White fluffy cheek tufts & muzzle
    cheek_L = add_sphere("bayu_cheekL", (-0.22, 0.15, 1.15), 0.14, scale=(1.2, 0.8, 0.9), mat=M_FUR_WHT)
    cheek_R = add_sphere("bayu_cheekR", (0.22, 0.15, 1.15), 0.14, scale=(1.2, 0.8, 0.9), mat=M_FUR_WHT)
    muzzle  = add_sphere("bayu_muzzle", (0, 0.22, 1.16), 0.13, scale=(1.2, 0.8, 0.8), mat=M_FUR_WHT)
    parts.extend([cheek_L, cheek_R, muzzle])

    # Big glossy violet anime eyes
    parts.extend(add_stylized_eye("bayu_eyeL", (-0.11, 0.28, 1.28), r=0.07, iris_mat=MAT_VIOLET_EYE, is_left=True))
    parts.extend(add_stylized_eye("bayu_eyeR", (0.11, 0.28, 1.28), r=0.07, iris_mat=MAT_VIOLET_EYE, is_left=False))

    # Cat nose and mouth
    nose = add_cone("bayu_nose", (0, 0.32, 1.20), 0.03, 0.02, rot=(R(90), 0, 0), mat=MAT_PINK_NOSE)
    mouth = add_torus("bayu_mouth", (0, 0.30, 1.12), 0.038, 0.009, rot=(R(90), 0, 0), mat=make_mat("Bayu_Lip", "#AA3355"))
    parts.extend([nose, mouth])

    # Rainbow fur body & white chest patch
    body = add_cylinder("bayu_body", (0, 0, 0.74), 0.25, 0.46, scale=(1.05, 0.95, 1.0), mat=M_FUR_YEL)
    chest = add_sphere("bayu_chest", (0, 0.14, 0.80), 0.18, scale=(0.9, 0.5, 1.1), mat=M_FUR_WHT)
    parts.extend([body, chest])

    # Fluffy paws
    arm_L = add_cylinder("bayu_armL", (-0.32, 0.04, 0.78), 0.09, 0.32, rot=(0, R(25), 0), mat=M_FUR_PNK)
    arm_R = add_cylinder("bayu_armR", (0.32, 0.04, 0.78), 0.09, 0.32, rot=(0, R(-25), 0), mat=M_FUR_BLU)
    paw_L = add_sphere("bayu_pawL", (-0.44, 0.04, 0.64), 0.08, mat=M_FUR_WHT)
    paw_R = add_sphere("bayu_pawR", (0.44, 0.04, 0.64), 0.08, mat=M_FUR_WHT)
    parts.extend([arm_L, arm_R, paw_L, paw_R])

    # Legs & Fluffy Tail
    leg_L = add_cylinder("bayu_legL", (-0.14, 0, 0.32), 0.10, 0.32, mat=M_FUR_BLU)
    leg_R = add_cylinder("bayu_legR", (0.14, 0, 0.32), 0.10, 0.32, mat=M_FUR_PNK)
    foot_L = add_sphere("bayu_footL", (-0.14, 0.06, 0.08), 0.085, scale=(1.0, 1.4, 0.8), mat=M_FUR_WHT)
    foot_R = add_sphere("bayu_footR", (0.14, 0.06, 0.08), 0.085, scale=(1.0, 1.4, 0.8), mat=M_FUR_WHT)
    tail = add_cylinder("bayu_tail", (0, -0.22, 0.54), 0.08, 0.38, rot=(R(-45), 0, 0), mat=M_FUR_BLU)
    parts.extend([leg_L, leg_R, foot_L, foot_R, tail])

    return parts

def build_riset_raka():
    """Agent 8: Tech anime boy, two-tone brunette & caramel parted hair, earring, maroon hoodie, backpack (Reference Image 8)"""
    parts = []
    M_HAIR_BRN = make_mat("Raka_HairBrn", "#3E2718")
    M_HAIR_GLD = make_mat("Raka_HairGld", "#C99A52")
    M_HOOD_MRN = make_mat("Raka_HoodMrn", "#782238")
    M_BACKPACK = make_mat("Raka_Backpack", "#334155")
    M_PANTS_DRK= make_mat("Raka_PantsDrk", "#1E293B")

    # Handsome anime face
    head = add_sphere("raka_head", (0, 0, 1.25), 0.27, scale=(0.96, 0.95, 1.02), mat=MAT_SKIN)
    parts.append(head)

    # Two-tone parted anime hairstyle (Dark brunette base, golden caramel side bangs)
    hair_back = add_sphere("raka_hairBack", (0, -0.05, 1.32), 0.29, scale=(1.04, 1.0, 1.05), mat=M_HAIR_BRN)
    bang_L = add_sphere("raka_bangL", (-0.10, 0.18, 1.34), 0.13, scale=(0.85, 0.5, 1.2), rot=(R(20), 0, R(15)), mat=M_HAIR_BRN)
    bang_R = add_sphere("raka_bangR", (0.10, 0.18, 1.34), 0.13, scale=(0.85, 0.5, 1.2), rot=(R(20), 0, R(-15)), mat=M_HAIR_GLD)
    parts.extend([hair_back, bang_L, bang_R])

    # Earring on left ear
    ear_L = add_sphere("raka_earL", (-0.26, 0, 1.22), 0.05, scale=(0.5, 0.8, 1.2), mat=MAT_SKIN)
    earring = add_torus("raka_earring", (-0.28, -0.01, 1.18), 0.02, 0.005, rot=(0, R(90), 0), mat=MAT_SILVER)
    parts.extend([ear_L, earring])

    # Hazel eyes & smirk
    parts.extend(add_stylized_eye("raka_eyeL", (-0.09, 0.22, 1.26), r=0.06, iris_mat=MAT_BROWN_EYE, is_left=True))
    parts.extend(add_stylized_eye("raka_eyeR", (0.09, 0.22, 1.26), r=0.06, iris_mat=MAT_BROWN_EYE, is_left=False))
    smirk = add_torus("raka_smirk", (0.02, 0.25, 1.15), 0.028, 0.007, rot=(R(85), 0, R(15)), mat=make_mat("Raka_Lip", "#A24355"))
    parts.append(smirk)

    # Rich Maroon Hoodie & Drawstrings
    hoodie = add_cylinder("raka_body", (0, 0, 0.76), 0.22, 0.46, mat=M_HOOD_MRN)
    string_L = add_cylinder("raka_strL", (-0.04, 0.15, 0.88), 0.008, 0.20, mat=MAT_WHITE)
    string_R = add_cylinder("raka_strR", (0.04, 0.15, 0.88), 0.008, 0.20, mat=MAT_WHITE)
    parts.extend([hoodie, string_L, string_R])

    # Tech Backpack with shoulder straps
    pack = add_cube("raka_pack", (0, -0.18, 0.80), 0.16, scale=(1.3, 0.8, 1.8), mat=M_BACKPACK)
    strap_L = add_cylinder("raka_strapL", (-0.14, 0.02, 0.82), 0.02, 0.36, rot=(R(15), 0, 0), mat=M_BACKPACK)
    strap_R = add_cylinder("raka_strapR", (0.14, 0.02, 0.82), 0.02, 0.36, rot=(R(15), 0, 0), mat=M_BACKPACK)
    parts.extend([pack, strap_L, strap_R])

    # Arms, Dark Pants & Sneakers
    arm_L = add_cylinder("raka_armL", (-0.30, 0.02, 0.80), 0.07, 0.32, rot=(0, R(20), 0), mat=M_HOOD_MRN)
    arm_R = add_cylinder("raka_armR", (0.30, 0.02, 0.80), 0.07, 0.32, rot=(0, R(-20), 0), mat=M_HOOD_MRN)
    hand_L = add_sphere("raka_handL", (-0.40, 0.02, 0.66), 0.055, mat=MAT_SKIN)
    hand_R = add_sphere("raka_handR", (0.40, 0.02, 0.66), 0.055, mat=MAT_SKIN)
    leg_L = add_cylinder("raka_legL", (-0.11, 0, 0.34), 0.08, 0.34, mat=M_PANTS_DRK)
    leg_R = add_cylinder("raka_legR", (0.11, 0, 0.34), 0.08, 0.34, mat=M_PANTS_DRK)
    shoe_L = add_cube("raka_shoeL", (-0.11, 0.05, 0.08), 0.11, scale=(0.9, 1.6, 0.8), mat=MAT_WHITE)
    shoe_R = add_cube("raka_shoeR", (0.11, 0.05, 0.08), 0.11, scale=(0.9, 1.6, 0.8), mat=MAT_WHITE)
    parts.extend([arm_L, arm_R, hand_L, hand_R, leg_L, leg_R, shoe_L, shoe_R])

    return parts

def build_konten_sekar():
    """Agent 9: Chibi girl scriptwriter with lavender twintails, cat clips, cropped jacket, pleated skirt"""
    parts = []
    M_LAV_HAIR = make_mat("Sekar_Hair", "#C0B2EC")
    M_JACK_MNT = make_mat("Sekar_JackMnt", "#82E2C8")
    M_SKIRT    = make_mat("Sekar_Skirt", "#EFA8C8")

    head = add_sphere("sekar_head", (0, 0, 1.25), 0.27, mat=MAT_SKIN)
    parts.append(head)

    # Hair with twintails and cat clips
    hair_base = add_sphere("sekar_hairBase", (0, -0.04, 1.34), 0.29, mat=M_LAV_HAIR)
    tail_L = add_sphere("sekar_tailL", (-0.24, -0.08, 1.32), 0.10, scale=(0.8, 0.8, 1.8), rot=(0, R(-20), R(15)), mat=M_LAV_HAIR)
    tail_R = add_sphere("sekar_tailR", (0.24, -0.08, 1.32), 0.10, scale=(0.8, 0.8, 1.8), rot=(0, R(20), R(-15)), mat=M_LAV_HAIR)
    parts.extend([hair_base, tail_L, tail_R])

    # Amber eyes & smile
    parts.extend(add_stylized_eye("sekar_eyeL", (-0.09, 0.22, 1.26), r=0.06, iris_mat=MAT_GOLD_EYE, is_left=True))
    parts.extend(add_stylized_eye("sekar_eyeR", (0.09, 0.22, 1.26), r=0.06, iris_mat=MAT_GOLD_EYE, is_left=False))

    # Mint cropped jacket & pink pleated skirt
    jacket = add_cylinder("sekar_body", (0, 0, 0.82), 0.21, 0.38, mat=M_JACK_MNT)
    skirt  = add_cone("sekar_skirt", (0, 0, 0.58), 0.25, 0.18, scale=(1.05, 0.95, 1.0), rot=(R(180), 0, 0), mat=M_SKIRT)
    parts.extend([jacket, skirt])

    # Arms holding script notebook/tablet
    arm_L = add_cylinder("sekar_armL", (-0.28, 0.08, 0.80), 0.065, 0.30, rot=(R(-30), R(20), 0), mat=M_JACK_MNT)
    arm_R = add_cylinder("sekar_armR", (0.28, 0.08, 0.80), 0.065, 0.30, rot=(R(-30), R(-20), 0), mat=M_JACK_MNT)
    hand_L = add_sphere("sekar_handL", (-0.36, 0.16, 0.68), 0.05, mat=MAT_SKIN)
    hand_R = add_sphere("sekar_handR", (0.36, 0.16, 0.68), 0.05, mat=MAT_SKIN)
    notebook = add_cube("sekar_book", (0, 0.22, 0.70), 0.12, scale=(1.2, 0.2, 1.5), mat=MAT_WHITE)
    parts.extend([arm_L, arm_R, hand_L, hand_R, notebook])

    # Legs & stylish sneakers
    leg_L = add_cylinder("sekar_legL", (-0.10, 0, 0.32), 0.075, 0.34, mat=MAT_SKIN)
    leg_R = add_cylinder("sekar_legR", (0.10, 0, 0.32), 0.075, 0.34, mat=MAT_SKIN)
    shoe_L = add_cube("sekar_shoeL", (-0.10, 0.04, 0.08), 0.10, scale=(0.9, 1.5, 0.8), mat=M_JACK_MNT)
    shoe_R = add_cube("sekar_shoeR", (0.10, 0.04, 0.08), 0.10, scale=(0.9, 1.5, 0.8), mat=M_SKIRT)
    parts.extend([leg_L, leg_R, shoe_L, shoe_R])

    return parts

def build_keuangan_sari():
    """Agent 10: Chic strategist with rose bob, golden data visor, coral blazer, mint pants, ledger tablet"""
    parts = []
    M_BOB_HAIR = make_mat("Sari_Hair", "#D89BAE")
    M_BLAZER   = make_mat("Sari_Blazer", "#F2788D")
    M_PANTS_MNT= make_mat("Sari_PantsMnt", "#78D8BD")
    M_VISOR    = make_mat("Sari_Visor", "#00F0FF", emissive_int=0.7)

    head = add_sphere("sari_head", (0, 0, 1.25), 0.27, mat=MAT_SKIN)
    parts.append(head)

    # Sleek chic bob haircut
    bob_back = add_sphere("sari_bob", (0, -0.04, 1.32), 0.30, scale=(1.05, 1.0, 1.05), mat=M_BOB_HAIR)
    parts.append(bob_back)

    # Smart Holographic Data Visor / Glasses
    visor = add_cube("sari_visor", (0, 0.22, 1.26), 0.08, scale=(2.2, 0.2, 0.45), mat=M_VISOR)
    parts.append(visor)

    # Coral tailored blazer over blouse
    blazer = add_cylinder("sari_body", (0, 0, 0.78), 0.22, 0.44, mat=M_BLAZER)
    collar = add_torus("sari_collar", (0, 0.06, 0.96), 0.12, 0.025, rot=(R(30), 0, 0), mat=MAT_WHITE)
    parts.extend([blazer, collar])

    # Arms holding digital holographic tablet
    arm_L = add_cylinder("sari_armL", (-0.30, 0.08, 0.80), 0.07, 0.32, rot=(R(-35), R(20), 0), mat=M_BLAZER)
    arm_R = add_cylinder("sari_armR", (0.30, 0.08, 0.80), 0.07, 0.32, rot=(R(-35), R(-20), 0), mat=M_BLAZER)
    hand_L = add_sphere("sari_handL", (-0.36, 0.16, 0.68), 0.05, mat=MAT_SKIN)
    hand_R = add_sphere("sari_handR", (0.36, 0.16, 0.68), 0.05, mat=MAT_SKIN)
    tablet = add_cube("sari_tablet", (0, 0.24, 0.70), 0.14, scale=(1.4, 0.15, 1.0), mat=M_VISOR)
    parts.extend([arm_L, arm_R, hand_L, hand_R, tablet])

    # Mint trousers & chic loafers
    leg_L = add_cylinder("sari_legL", (-0.11, 0, 0.34), 0.08, 0.34, mat=M_PANTS_MNT)
    leg_R = add_cylinder("sari_legR", (0.11, 0, 0.34), 0.08, 0.34, mat=M_PANTS_MNT)
    shoe_L = add_cube("sari_shoeL", (-0.11, 0.04, 0.08), 0.10, scale=(0.85, 1.5, 0.7), mat=MAT_BLACK)
    shoe_R = add_cube("sari_shoeR", (0.11, 0.04, 0.08), 0.10, scale=(0.85, 1.5, 0.7), mat=MAT_BLACK)
    parts.extend([leg_L, leg_R, shoe_L, shoe_R])

    return parts

AGENT_BUILDERS = [
    ("kasir_dina",     build_kasir_dina),
    ("pesanan_rina",   build_pesanan_rina),
    ("manajer_ratna",  build_manajer_ratna),
    ("laporan_doni",   build_laporan_doni),
    ("desain_lita",    build_desain_lita),
    ("cs_fajar",       build_cs_fajar),
    ("stok_bayu",      build_stok_bayu),
    ("riset_raka",     build_riset_raka),
    ("konten_sekar",   build_konten_sekar),
    ("keuangan_sari",  build_keuangan_sari),
]

# ─────────────────────── ARMATURE & RIGGING ───────────────────────

BONE_CHAIN = [
    # (name, head_xyz, tail_xyz, parent)
    ("Root",      (0, 0, 0),         (0, 0, 0.1),       None),
    ("Hips",      (0, 0, 0.55),      (0, 0, 0.75),      "Root"),
    ("Spine",     (0, 0, 0.75),      (0, 0, 1.00),      "Hips"),
    ("Neck",      (0, 0, 1.00),      (0, 0, 1.12),      "Spine"),
    ("Head",      (0, 0, 1.12),      (0, 0, 1.40),      "Neck"),
    ("ShoulderL", (-0.08, 0, 0.98),  (-0.22, 0, 0.98),  "Spine"),
    ("ArmL",      (-0.22, 0, 0.98),  (-0.38, 0, 0.82),  "ShoulderL"),
    ("ForearmL",  (-0.38, 0, 0.82),  (-0.50, 0, 0.66),  "ArmL"),
    ("HandL",     (-0.50, 0, 0.66),  (-0.58, 0, 0.58),  "ForearmL"),
    ("ShoulderR", (0.08, 0, 0.98),   (0.22, 0, 0.98),   "Spine"),
    ("ArmR",      (0.22, 0, 0.98),   (0.38, 0, 0.82),   "ShoulderR"),
    ("ForearmR",  (0.38, 0, 0.82),   (0.50, 0, 0.66),   "ArmR"),
    ("HandR",     (0.50, 0, 0.66),   (0.58, 0, 0.58),   "ForearmR"),
    ("ThighL",    (-0.12, 0, 0.55),  (-0.12, 0, 0.30),  "Hips"),
    ("ShinL",     (-0.12, 0, 0.30),  (-0.12, 0, 0.08),  "ThighL"),
    ("FootL",     (-0.12, 0, 0.08),  (-0.12, 0.10, 0.02), "ShinL"),
    ("ThighR",    (0.12, 0, 0.55),   (0.12, 0, 0.30),   "Hips"),
    ("ShinR",     (0.12, 0, 0.30),   (0.12, 0, 0.08),   "ThighR"),
    ("FootR",     (0.12, 0, 0.08),   (0.12, 0.10, 0.02), "ShinR"),
]

def build_armature(key):
    bpy.ops.object.armature_add(location=(0, 0, 0))
    arm_obj = bpy.context.active_object
    arm_obj.name = f"{key}_armature"
    arm = arm_obj.data
    arm.name = f"{key}_arm_data"

    bpy.ops.object.mode_set(mode="EDIT")
    for b in arm.edit_bones:
        arm.edit_bones.remove(b)

    created = {}
    for bone_name, head_xyz, tail_xyz, parent_name in BONE_CHAIN:
        b = arm.edit_bones.new(bone_name)
        b.head = head_xyz
        b.tail = tail_xyz
        if parent_name and parent_name in created:
            b.parent = created[parent_name]
        created[bone_name] = b

    bpy.ops.object.mode_set(mode="OBJECT")
    return arm_obj

def insert_bone_rot(arm_obj, bone_name, frame, rot_euler):
    pb = arm_obj.pose.bones.get(bone_name)
    if not pb: return
    pb.rotation_mode = "XYZ"
    pb.rotation_euler = rot_euler
    pb.keyframe_insert(data_path="rotation_euler", frame=frame)

def insert_bone_loc(arm_obj, bone_name, frame, loc):
    pb = arm_obj.pose.bones.get(bone_name)
    if not pb: return
    pb.location = loc
    pb.keyframe_insert(data_path="location", frame=frame)

def build_animations(arm_obj, key):
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode="POSE")

    anim_specs = [
        ("Idle", 1, 60),
        ("Walk", 61, 100),
        ("Sit", 101, 130),
        ("Type", 131, 180),
        ("Talk", 181, 220),
        ("Think", 221, 260),
        ("Celebrate", 261, 320),
    ]

    for anim_name, f_start, f_end in anim_specs:
        action = bpy.data.actions.new(name=f"{key}_{anim_name}")
        arm_obj.animation_data_create()
        arm_obj.animation_data.action = action

        if anim_name == "Idle":
            for f in range(f_start, f_end + 1, 10):
                t = math.sin(((f - f_start) / max(f_end - f_start, 1)) * math.pi * 2)
                insert_bone_loc(arm_obj, "Spine", f, (0, 0, 0.015 * t))
                insert_bone_rot(arm_obj, "Head", f, (R(3 * t), 0, R(5 * t)))
                insert_bone_rot(arm_obj, "ArmL", f, (0, 0, R(5 * t)))
                insert_bone_rot(arm_obj, "ArmR", f, (0, 0, R(-5 * t)))

        elif anim_name == "Walk":
            for f in range(f_start, f_end + 1, 5):
                phase = ((f - f_start) / max(f_end - f_start, 1)) * math.pi * 2
                leg_swing = R(30) * math.sin(phase)
                arm_swing = R(25) * math.sin(phase)
                insert_bone_rot(arm_obj, "ThighL", f, (leg_swing, 0, 0))
                insert_bone_rot(arm_obj, "ThighR", f, (-leg_swing, 0, 0))
                insert_bone_rot(arm_obj, "ShinL", f, (max(0, -leg_swing * 0.7), 0, 0))
                insert_bone_rot(arm_obj, "ShinR", f, (max(0, leg_swing * 0.7), 0, 0))
                insert_bone_rot(arm_obj, "ArmL", f, (-arm_swing, 0, 0))
                insert_bone_rot(arm_obj, "ArmR", f, (arm_swing, 0, 0))
                insert_bone_loc(arm_obj, "Hips", f, (0, 0, 0.03 * abs(math.sin(phase))))

        elif anim_name == "Sit":
            for f in [f_start, f_end]:
                insert_bone_rot(arm_obj, "ThighL", f, (R(80), 0, 0))
                insert_bone_rot(arm_obj, "ThighR", f, (R(80), 0, 0))
                insert_bone_rot(arm_obj, "ShinL", f, (R(-80), 0, 0))
                insert_bone_rot(arm_obj, "ShinR", f, (R(-80), 0, 0))
                insert_bone_rot(arm_obj, "Spine", f, (R(5), 0, 0))
                insert_bone_rot(arm_obj, "ArmL", f, (R(-25), 0, R(10)))
                insert_bone_rot(arm_obj, "ArmR", f, (R(-25), 0, R(-10)))

        elif anim_name == "Type":
            for f in range(f_start, f_end + 1, 6):
                phase = ((f - f_start) / max(f_end - f_start, 1)) * math.pi * 4
                hand_bob = R(15) * math.sin(phase)
                insert_bone_rot(arm_obj, "ThighL", f, (R(80), 0, 0))
                insert_bone_rot(arm_obj, "ThighR", f, (R(80), 0, 0))
                insert_bone_rot(arm_obj, "ShinL", f, (R(-80), 0, 0))
                insert_bone_rot(arm_obj, "ShinR", f, (R(-80), 0, 0))
                insert_bone_rot(arm_obj, "ArmL", f, (R(-45), 0, R(5)))
                insert_bone_rot(arm_obj, "ArmR", f, (R(-45), 0, R(-5)))
                insert_bone_rot(arm_obj, "ForearmL", f, (R(65), 0, 0))
                insert_bone_rot(arm_obj, "ForearmR", f, (R(65), 0, 0))
                insert_bone_rot(arm_obj, "HandL", f, (hand_bob, 0, 0))
                insert_bone_rot(arm_obj, "HandR", f, (-hand_bob, 0, 0))

        elif anim_name == "Talk":
            for f in range(f_start, f_end + 1, 8):
                phase = ((f - f_start) / max(f_end - f_start, 1)) * math.pi * 2
                nod = R(8) * math.sin(phase * 2)
                gesture = R(30) * math.sin(phase)
                insert_bone_rot(arm_obj, "Head", f, (nod, 0, R(4) * math.cos(phase)))
                insert_bone_rot(arm_obj, "ArmR", f, (R(-45) + gesture, 0, R(-20)))
                insert_bone_rot(arm_obj, "ForearmR", f, (R(50), 0, 0))

        elif anim_name == "Think":
            for f in [f_start, f_end]:
                insert_bone_rot(arm_obj, "Head", f, (R(-10), R(-12), R(8)))
                insert_bone_rot(arm_obj, "ArmR", f, (R(-85), 0, R(-25)))
                insert_bone_rot(arm_obj, "ForearmR", f, (R(110), 0, 0))
                insert_bone_rot(arm_obj, "ArmL", f, (R(-15), 0, R(15)))

        elif anim_name == "Celebrate":
            for f in range(f_start, f_end + 1, 6):
                phase = ((f - f_start) / max(f_end - f_start, 1)) * math.pi * 3
                wave = R(20) * math.sin(phase)
                bounce = 0.05 * abs(math.sin(phase))
                insert_bone_loc(arm_obj, "Hips", f, (0, 0, bounce))
                insert_bone_rot(arm_obj, "ArmL", f, (R(-135) + wave, 0, R(-20)))
                insert_bone_rot(arm_obj, "ArmR", f, (R(-135) - wave, 0, R(20)))
                insert_bone_rot(arm_obj, "Head", f, (R(-15), 0, wave * 0.5))

    bpy.ops.object.mode_set(mode="OBJECT")

def export_character(key, builder_fn):
    clear_scene()
    print(f"\n[{key}] Modeling high-detail character...")
    parts = builder_fn()

    # Join all mesh parts into single skinned mesh
    bpy.ops.object.select_all(action="DESELECT")
    for obj in parts:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    mesh_obj = bpy.context.active_object
    mesh_obj.name = f"{key}_mesh"

    # Build armature and parent
    arm_obj = build_armature(key)
    bpy.ops.object.select_all(action="DESELECT")
    mesh_obj.select_set(True)
    arm_obj.select_set(True)
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.parent_set(type="ARMATURE_ENVELOPE")

    # Generate 7 Animation Actions
    build_animations(arm_obj, key)

    # Export to GLB
    out_path = os.path.join(OUTPUT_DIR, f"{key}.glb")
    bpy.ops.object.select_all(action="DESELECT")
    arm_obj.select_set(True)
    mesh_obj.select_set(True)
    bpy.context.view_layer.objects.active = arm_obj

    bpy.ops.export_scene.gltf(
        filepath=out_path,
        use_selection=True,
        export_format="GLB",
        export_animations=True,
        export_animation_mode="ACTIONS",
        export_skins=True,
        export_apply=False,
        export_yup=True,
        export_lights=False,
        export_cameras=False,
    )
    size = os.path.getsize(out_path)
    print(f"  ✓ Exported {out_path} ({size:,} bytes)")
    return size

def main():
    print("=" * 60)
    print("Kantor AI — Detailed 3D Agent Model Generator")
    print("=" * 60)

    for key, builder in AGENT_BUILDERS:
        try:
            export_character(key, builder)
        except Exception as e:
            print(f"ERROR on {key}: {e}")
            traceback.print_exc()

    print("\nAll 10 detailed agent models generated!")

if __name__ == "__main__":
    main()
