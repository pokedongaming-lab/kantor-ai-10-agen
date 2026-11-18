"""
gen_agents_glb.py — Blender 4.2 headless script
Generates 10 chibi-style animated GLB character files for Kantor AI agents.
Run with: blender -b --python scripts/gen_agents_glb.py
"""

import bpy
import math
import os
import sys
import traceback

# ─────────────────────────── CONFIG ───────────────────────────
OUTPUT_DIR = r"c:\Users\admin\kantor-ai-10-agen\public\models\agents"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Agent definitions: key, colors (body, head, detail1, detail2, hair, pants, shoes)
AGENTS = [
    {
        "key": "kasir_dina",
        "colors": {
            "body":   (0.68, 0.85, 0.95, 1),   # pastel blue
            "head":   (0.68, 0.85, 0.95, 1),
            "detail": (0.80, 0.95, 0.85, 1),   # mint
            "hair":   (0.68, 0.85, 0.95, 1),
            "accent": (1.00, 0.75, 0.80, 1),   # pink
            "pants":  (0.80, 0.95, 0.85, 1),
            "shoes":  (1.00, 0.75, 0.80, 1),
        },
    },
    {
        "key": "pesanan_rina",
        "colors": {
            "body":   (0.70, 0.75, 0.95, 1),   # blue-purple
            "head":   (1.00, 0.90, 0.85, 1),   # skin
            "detail": (0.80, 0.70, 0.95, 1),   # purple
            "hair":   (0.80, 0.75, 0.95, 1),   # lavender
            "accent": (0.70, 0.75, 0.95, 1),
            "pants":  (0.80, 0.70, 0.95, 1),
            "shoes":  (0.60, 0.65, 0.90, 1),
        },
    },
    {
        "key": "cs_fajar",
        "colors": {
            "body":   (1.00, 0.75, 0.80, 1),   # pink hoodie
            "head":   (1.00, 0.90, 0.85, 1),   # skin
            "detail": (1.00, 0.75, 0.80, 1),
            "hair":   (0.55, 0.75, 0.95, 1),   # blue hair
            "accent": (0.80, 0.95, 0.85, 1),   # mint-green pants
            "pants":  (0.80, 0.95, 0.85, 1),
            "shoes":  (0.70, 0.60, 0.90, 1),   # purple sneakers
        },
    },
    {
        "key": "stok_bayu",
        "colors": {
            "body":   (1.00, 0.75, 0.85, 1),   # pink fur
            "head":   (0.80, 0.95, 0.85, 1),   # mint
            "detail": (0.80, 0.75, 0.95, 1),   # lavender
            "hair":   (1.00, 0.75, 0.85, 1),
            "accent": (0.80, 0.95, 0.85, 1),
            "pants":  (0.80, 0.75, 0.95, 1),
            "shoes":  (1.00, 0.85, 0.65, 1),   # peach
        },
    },
    {
        "key": "keuangan_sari",
        "colors": {
            "body":   (0.80, 0.95, 0.85, 1),   # mint gradient start
            "head":   (0.80, 0.95, 0.85, 1),
            "detail": (0.80, 0.75, 0.95, 1),   # lavender
            "hair":   (1.00, 0.75, 0.85, 1),   # pink end
            "accent": (1.00, 0.75, 0.85, 1),
            "pants":  (0.80, 0.75, 0.95, 1),
            "shoes":  (1.00, 0.75, 0.80, 1),
        },
    },
    {
        "key": "riset_raka",
        "colors": {
            "body":   (0.85, 0.30, 0.40, 1),   # red hoodie
            "head":   (1.00, 0.90, 0.85, 1),   # skin
            "detail": (0.60, 0.30, 0.80, 1),   # purple
            "hair":   (0.25, 0.18, 0.12, 1),   # dark brown
            "accent": (0.90, 0.80, 0.40, 1),   # blonde streak
            "pants":  (0.25, 0.25, 0.35, 1),   # dark pants
            "shoes":  (0.20, 0.20, 0.25, 1),
        },
    },
    {
        "key": "konten_sekar",
        "colors": {
            "body":   (0.75, 0.95, 0.85, 1),   # mint hoodie
            "head":   (1.00, 0.90, 0.85, 1),   # skin
            "detail": (1.00, 0.75, 0.85, 1),   # pink skirt
            "hair":   (0.80, 0.75, 0.95, 1),   # lavender hair
            "accent": (1.00, 0.75, 0.85, 1),
            "pants":  (1.00, 0.75, 0.85, 1),
            "shoes":  (1.00, 0.85, 0.80, 1),   # peach
        },
    },
    {
        "key": "desain_lita",
        "colors": {
            "body":   (0.60, 0.75, 0.95, 1),   # blue tracksuit
            "head":   (1.00, 0.90, 0.85, 1),   # skin
            "detail": (0.70, 0.60, 0.95, 1),   # purple split
            "hair":   (0.50, 0.70, 0.95, 1),   # blue hair
            "accent": (0.70, 0.60, 0.95, 1),
            "pants":  (0.60, 0.75, 0.95, 1),
            "shoes":  (0.50, 0.60, 0.90, 1),
        },
    },
    {
        "key": "laporan_doni",
        "colors": {
            "body":   (1.00, 0.75, 0.85, 1),   # pink hoodie
            "head":   (1.00, 0.90, 0.85, 1),   # skin
            "detail": (1.00, 0.75, 0.85, 1),
            "hair":   (0.55, 0.75, 0.95, 1),   # blue hair
            "accent": (0.80, 0.95, 0.85, 1),
            "pants":  (0.80, 0.95, 0.85, 1),   # mint pants
            "shoes":  (0.70, 0.60, 0.90, 1),
        },
    },
    {
        "key": "manajer_ratna",
        "colors": {
            "body":   (0.80, 0.90, 0.95, 1),   # pastel multicolor tracksuit
            "head":   (1.00, 0.88, 0.80, 1),   # mature skin
            "detail": (1.00, 0.80, 0.85, 1),   # pink accent
            "hair":   (0.75, 0.88, 0.98, 1),   # blue-white gradient
            "accent": (1.00, 0.80, 0.85, 1),
            "pants":  (0.85, 0.80, 0.95, 1),   # lavender
            "shoes":  (0.75, 0.88, 0.98, 1),
        },
    },
]


# ─────────────────────── MATERIAL UTILS ───────────────────────

def make_material(name, color):
    """Create or reuse a simple emission+diffuse material."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = 0.6
    bsdf.inputs["Specular IOR Level"].default_value = 0.3
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


# ─────────────────────── MESH BUILDERS ───────────────────────

def add_sphere(name, location, radius, segments=16):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=segments, ring_count=segments // 2,
        radius=radius, location=location
    )
    obj = bpy.context.active_object
    obj.name = name
    return obj


def add_cylinder(name, location, radius, depth, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=16, radius=radius, depth=depth,
        location=location, rotation=rotation
    )
    obj = bpy.context.active_object
    obj.name = name
    return obj


def add_capsule(name, location, radius, depth, rotation=(0, 0, 0)):
    """Approximate capsule with a cylinder + two half-spheres via subdivision."""
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=12, radius=radius, depth=depth,
        location=location, rotation=rotation
    )
    obj = bpy.context.active_object
    obj.name = name
    # Smooth shading
    bpy.ops.object.shade_smooth()
    return obj


# ─────────────────────── ARMATURE BUILDER ───────────────────────

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


def build_armature(agent_key):
    """Create armature and return (armature_obj, pose_bones_dict)."""
    bpy.ops.object.armature_add(location=(0, 0, 0))
    arm_obj = bpy.context.active_object
    arm_obj.name = f"{agent_key}_armature"
    arm = arm_obj.data
    arm.name = f"{agent_key}_arm_data"

    bpy.ops.object.mode_set(mode="EDIT")
    # Remove default bone
    for b in arm.edit_bones:
        arm.edit_bones.remove(b)

    created = {}
    for (name, head, tail, parent_name) in BONE_CHAIN:
        eb = arm.edit_bones.new(name)
        eb.head = head
        eb.tail = tail
        if parent_name:
            eb.parent = created[parent_name]
            eb.use_connect = False
        created[name] = eb

    bpy.ops.object.mode_set(mode="OBJECT")
    return arm_obj


# ─────────────────────── CHARACTER BUILDER ───────────────────────

def build_character(agent):
    key = agent["key"]
    C = agent["colors"]
    print(f"[BUILD] {key} ...")

    # Clear scene objects
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    # ── Mesh parts ──
    parts = []

    # Head (large sphere, chibi)
    head = add_sphere(f"{key}_head", (0, 0, 1.22), 0.28)
    head.data.materials.append(make_material(f"{key}_mat_head", C["head"]))
    parts.append(head)

    # Hair blob (sphere slightly larger, offset back/up)
    hair = add_sphere(f"{key}_hair", (0, -0.06, 1.30), 0.26)
    hair.data.materials.append(make_material(f"{key}_mat_hair", C["hair"]))
    parts.append(hair)

    # Body
    body = add_capsule(f"{key}_body", (0, 0, 0.78), 0.22, 0.46)
    body.data.materials.append(make_material(f"{key}_mat_body", C["body"]))
    parts.append(body)

    # Hips / lower body
    hips = add_cylinder(f"{key}_hips", (0, 0, 0.55), 0.20, 0.18)
    hips.data.materials.append(make_material(f"{key}_mat_pants", C["pants"]))
    parts.append(hips)

    # Left arm
    armL = add_capsule(f"{key}_armL", (-0.34, 0, 0.84), 0.07, 0.30,
                       rotation=(0, math.radians(30), 0))
    armL.data.materials.append(make_material(f"{key}_mat_armL", C["body"]))
    parts.append(armL)

    # Right arm
    armR = add_capsule(f"{key}_armR", (0.34, 0, 0.84), 0.07, 0.30,
                       rotation=(0, math.radians(-30), 0))
    armR.data.materials.append(make_material(f"{key}_mat_armR", C["body"]))
    parts.append(armR)

    # Left hand
    handL = add_sphere(f"{key}_handL", (-0.50, 0, 0.66), 0.07, segments=8)
    handL.data.materials.append(make_material(f"{key}_mat_handL", C["accent"]))
    parts.append(handL)

    # Right hand
    handR = add_sphere(f"{key}_handR", (0.50, 0, 0.66), 0.07, segments=8)
    handR.data.materials.append(make_material(f"{key}_mat_handR", C["accent"]))
    parts.append(handR)

    # Left thigh
    thighL = add_capsule(f"{key}_thighL", (-0.12, 0, 0.42), 0.09, 0.26)
    thighL.data.materials.append(make_material(f"{key}_mat_thighL", C["pants"]))
    parts.append(thighL)

    # Right thigh
    thighR = add_capsule(f"{key}_thighR", (0.12, 0, 0.42), 0.09, 0.26)
    thighR.data.materials.append(make_material(f"{key}_mat_thighR", C["pants"]))
    parts.append(thighR)

    # Left shin
    shinL = add_capsule(f"{key}_shinL", (-0.12, 0, 0.19), 0.075, 0.22)
    shinL.data.materials.append(make_material(f"{key}_mat_shinL", C["pants"]))
    parts.append(shinL)

    # Right shin
    shinR = add_capsule(f"{key}_shinR", (0.12, 0, 0.19), 0.075, 0.22)
    shinR.data.materials.append(make_material(f"{key}_mat_shinR", C["pants"]))
    parts.append(shinR)

    # Left foot
    footL = add_cylinder(f"{key}_footL", (-0.12, 0.05, 0.05), 0.08, 0.10,
                         rotation=(math.radians(90), 0, 0))
    footL.data.materials.append(make_material(f"{key}_mat_footL", C["shoes"]))
    parts.append(footL)

    # Right foot
    footR = add_cylinder(f"{key}_footR", (0.12, 0.05, 0.05), 0.08, 0.10,
                         rotation=(math.radians(90), 0, 0))
    footR.data.materials.append(make_material(f"{key}_mat_footR", C["shoes"]))
    parts.append(footR)

    # Smooth all meshes
    for obj in parts:
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.shade_smooth()

    # ── Join all mesh parts ──
    bpy.ops.object.select_all(action="DESELECT")
    for obj in parts:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    mesh_obj = bpy.context.active_object
    mesh_obj.name = f"{key}_mesh"

    # ── Build armature ──
    arm_obj = build_armature(key)

    # ── Parent mesh to armature with auto weights ──
    bpy.ops.object.select_all(action="DESELECT")
    mesh_obj.select_set(True)
    arm_obj.select_set(True)
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.parent_set(type="ARMATURE_ENVELOPE")

    return arm_obj, mesh_obj


# ─────────────────────── ANIMATION BUILDER ───────────────────────

def insert_bone_rotation(arm_obj, bone_name, frame, euler_xyz):
    """Insert a rotation keyframe on a pose bone."""
    pose_bone = arm_obj.pose.bones.get(bone_name)
    if pose_bone is None:
        return
    pose_bone.rotation_mode = "XYZ"
    pose_bone.rotation_euler = euler_xyz
    pose_bone.keyframe_insert(data_path="rotation_euler", frame=frame)


def insert_bone_location(arm_obj, bone_name, frame, location):
    """Insert a location keyframe on a pose bone."""
    pose_bone = arm_obj.pose.bones.get(bone_name)
    if pose_bone is None:
        return
    pose_bone.location = location
    pose_bone.keyframe_insert(data_path="location", frame=frame)


def reset_pose(arm_obj):
    """Zero out all pose bone transforms."""
    for pb in arm_obj.pose.bones:
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = (0, 0, 0)
        pb.location = (0, 0, 0)
        pb.scale = (1, 1, 1)


def build_animations(arm_obj, agent_key):
    """Create 7 Actions on the armature."""
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode="POSE")

    R = math.radians
    animations = [
        ("Idle",      1,   60),
        ("Walk",      61,  100),
        ("Sit",       101, 130),
        ("Type",      131, 180),
        ("Talk",      181, 220),
        ("Think",     221, 260),
        ("Celebrate", 261, 320),
    ]

    for (anim_name, f_start, f_end) in animations:
        action_name = f"{agent_key}_{anim_name}"
        action = bpy.data.actions.new(name=action_name)
        arm_obj.animation_data_create()
        arm_obj.animation_data.action = action

        reset_pose(arm_obj)
        mid = (f_start + f_end) // 2

        if anim_name == "Idle":
            # Breathing: Spine bobs slightly, Head slight rotate
            for f in [f_start, mid, f_end]:
                t = 1 if f == mid else 0
                insert_bone_location(arm_obj, "Spine", f, (0, 0, 0.015 * t))
                insert_bone_rotation(arm_obj, "Head", f, (R(3 * t), 0, R(5 * t)))
                insert_bone_rotation(arm_obj, "Hips", f, (0, 0, 0))

        elif anim_name == "Walk":
            # Leg swing, arm counter-swing
            for f in range(f_start, f_end + 1, 10):
                phase = ((f - f_start) / (f_end - f_start)) * math.pi * 2
                leg_swing = R(25) * math.sin(phase)
                arm_swing = R(20) * math.sin(phase + math.pi)
                insert_bone_rotation(arm_obj, "ThighL", f, (leg_swing, 0, 0))
                insert_bone_rotation(arm_obj, "ThighR", f, (-leg_swing, 0, 0))
                insert_bone_rotation(arm_obj, "ShinL", f,
                                     (max(0, leg_swing * 0.5), 0, 0))
                insert_bone_rotation(arm_obj, "ShinR", f,
                                     (max(0, -leg_swing * 0.5), 0, 0))
                insert_bone_rotation(arm_obj, "ArmL", f, (arm_swing, 0, 0))
                insert_bone_rotation(arm_obj, "ArmR", f, (-arm_swing, 0, 0))
                insert_bone_location(arm_obj, "Hips", f,
                                     (0, 0, 0.03 * abs(math.sin(phase))))

        elif anim_name == "Sit":
            # Legs bent ~90°, spine leaned slightly
            for f in [f_start, f_end]:
                t = 1 if f == f_end else 0
                insert_bone_rotation(arm_obj, "ThighL", f, (R(80 * t), 0, 0))
                insert_bone_rotation(arm_obj, "ThighR", f, (R(80 * t), 0, 0))
                insert_bone_rotation(arm_obj, "ShinL", f, (R(-80 * t), 0, 0))
                insert_bone_rotation(arm_obj, "ShinR", f, (R(-80 * t), 0, 0))
                insert_bone_rotation(arm_obj, "Spine", f, (R(10 * t), 0, 0))
                insert_bone_rotation(arm_obj, "ArmL", f, (R(-20 * t), 0, 0))
                insert_bone_rotation(arm_obj, "ArmR", f, (R(-20 * t), 0, 0))

        elif anim_name == "Type":
            # Arms forward, hands alternate up-down
            for f in range(f_start, f_end + 1, 8):
                phase = ((f - f_start) / max(f_end - f_start, 1)) * math.pi * 4
                hand_bob = R(15) * math.sin(phase)
                insert_bone_rotation(arm_obj, "ArmL", f, (R(-40), 0, 0))
                insert_bone_rotation(arm_obj, "ArmR", f, (R(-40), 0, 0))
                insert_bone_rotation(arm_obj, "ForearmL", f, (R(60), 0, 0))
                insert_bone_rotation(arm_obj, "ForearmR", f, (R(60), 0, 0))
                insert_bone_rotation(arm_obj, "HandL", f, (hand_bob, 0, 0))
                insert_bone_rotation(arm_obj, "HandR", f, (-hand_bob, 0, 0))

        elif anim_name == "Talk":
            # Head nods, right arm gesture
            for f in range(f_start, f_end + 1, 8):
                phase = ((f - f_start) / max(f_end - f_start, 1)) * math.pi * 3
                nod = R(12) * math.sin(phase)
                gesture = R(20) * math.sin(phase)
                insert_bone_rotation(arm_obj, "Head", f, (nod, 0, 0))
                insert_bone_rotation(arm_obj, "ArmR", f, (R(-30) + gesture, 0, 0))
                insert_bone_rotation(arm_obj, "ForearmR", f, (R(40), 0, 0))

        elif anim_name == "Think":
            # Left hand to chin, head tilt
            for f in [f_start, mid, f_end]:
                t = 1 if f >= mid else 0
                insert_bone_rotation(arm_obj, "Head", f, (0, 0, R(-10 * t)))
                insert_bone_rotation(arm_obj, "ArmL", f, (R(-50 * t), 0, 0))
                insert_bone_rotation(arm_obj, "ForearmL", f, (R(80 * t), 0, 0))
                insert_bone_rotation(arm_obj, "HandL", f, (R(10 * t), 0, 0))

        elif anim_name == "Celebrate":
            # Both arms up, body bounce
            for f in range(f_start, f_end + 1, 8):
                phase = ((f - f_start) / max(f_end - f_start, 1)) * math.pi * 4
                bounce = 0.04 * abs(math.sin(phase))
                wave = R(20) * math.sin(phase)
                insert_bone_location(arm_obj, "Hips", f, (0, 0, bounce))
                insert_bone_rotation(arm_obj, "ArmL", f, (R(-130) + wave, 0, R(-15)))
                insert_bone_rotation(arm_obj, "ArmR", f, (R(-130) - wave, 0, R(15)))
                insert_bone_rotation(arm_obj, "ForearmL", f, (R(10), 0, 0))
                insert_bone_rotation(arm_obj, "ForearmR", f, (R(10), 0, 0))

        # Tag action with fake user so it won't be garbage-collected
        action.use_fake_user = True

    bpy.ops.object.mode_set(mode="OBJECT")
    print(f"  → {len(animations)} actions created for {agent_key}")


# ─────────────────────── EXPORT ───────────────────────

def export_glb(agent_key, arm_obj, mesh_obj):
    out_path = os.path.join(OUTPUT_DIR, f"{agent_key}.glb")

    # Select only armature + mesh
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
    size = os.path.getsize(out_path) if os.path.exists(out_path) else 0
    print(f"  → Exported: {out_path} ({size:,} bytes)")
    return out_path, size


# ─────────────────────── MAIN ───────────────────────

def main():
    print("=" * 60)
    print("Kantor AI — GLB Character Generator")
    print(f"Output: {OUTPUT_DIR}")
    print("=" * 60)

    results = []

    for agent in AGENTS:
        key = agent["key"]
        try:
            print(f"\n[{key}] Building character...")
            arm_obj, mesh_obj = build_character(agent)
            build_animations(arm_obj, key)
            path, size = export_glb(key, arm_obj, mesh_obj)
            results.append({"key": key, "path": path, "size": size, "ok": True})
        except Exception as e:
            print(f"  ERROR on {key}: {e}")
            traceback.print_exc()
            results.append({"key": key, "path": "", "size": 0, "ok": False, "err": str(e)})

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    ok_count = 0
    for r in results:
        status = "OK" if r["ok"] else "FAILED"
        size_str = f"{r['size']:>10,} bytes" if r["ok"] else "         N/A"
        print(f"  [{status}] {r['key']:<20} {size_str}  {r['path']}")
        if r["ok"]:
            ok_count += 1

    print(f"\n{ok_count}/{len(AGENTS)} agents exported successfully.")
    print("=" * 60)

    if ok_count < len(AGENTS):
        sys.exit(1)


if __name__ == "__main__":
    main()
