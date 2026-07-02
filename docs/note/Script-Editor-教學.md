# Isaac Sim Script Editor 實戰教學

> 一份專為 **Script Editor** 工作流程設計的循序教學，適用 **Isaac Sim 6.0.x**。
> 所有程式碼均使用官方目前主推的 **Core Experimental API**（`isaacsim.core.experimental.*`）。
> 背景知識請搭配《[Isaac Sim 中文文檔](./Isaac-Sim-中文文檔.md)》閱讀。

**學習目標**：完成本教學後，你將能夠不碰滑鼠選單，只用 Python 在 Script Editor 中——建立場景、賦予物理、操作位姿、載入並控制 Franka 機械手臂、註冊每步回呼，最後把成果存成 USD 檔。

**預備條件**：已完成 Isaac Sim 安裝（見中文文檔第 3 章），具備基礎 Python 知識。

---

## 第 0 課：認識 Script Editor

Script Editor 是 Omniverse Kit 內建的 Python 編輯執行環境，可直接對目前的 USD stage 下指令——它是「Extension 工作流程」最容易上手的入口。

### 開啟方式

選單列 **Window > Script Editor**。建議把視窗拖曳停靠在 Viewport 下方，寫程式時同步看到場景變化。

### 介面與操作重點

| 功能 | 說明 |
|---|---|
| **執行** | 按下方 **Run** 按鈕，或快捷鍵 **Ctrl+Enter** |
| **執行部分程式** | 反白選取一段程式再執行，只會跑選取的部分（除錯利器） |
| **多分頁** | **Tab > Add Tab** 開新分頁；**所有分頁共享同一個 Python 環境**——A 分頁 import 的模組、定義的變數，B 分頁可以直接用 |
| **內建範例** | **Snippets** 選單有一批示範 Kit API 核心概念的程式片段 |
| **開檔／存檔** | Windows 上可 Open/Save/Save As 到磁碟（選單在 Linux 上顯示但無作用） |
| **輸出位置** | `print()` 的結果顯示在編輯器下方的輸出區，同時也會出現在啟動 Isaac Sim 的**終端機**；跑很長的 callback 輸出時看終端機比較方便 |

### 兩個必須先建立的心智模型

1. **非同步執行**：Script Editor 的程式與渲染、物理**並行**。你的腳本跑完就結束了，模擬世界繼續走自己的時間。想「每個物理步都做某件事」，要註冊 callback（第 7 課）。
2. **物理要 Play 才會動**：Viewport 一打開就在渲染，但**物理引擎只在你按下 Play 之後才步進**。所有讀寫關節狀態、施力、接觸查詢的 API，都必須在模擬播放中才有效。

> 練習：開啟 Script Editor，輸入 `print("Hello Isaac Sim")` 按 Ctrl+Enter，確認輸出區看得到文字。

---

## 第 1 課：Hello Stage——建立新場景與地板

在 Script Editor 貼上並執行：

```python
import isaacsim.core.experimental.utils.stage as stage_utils
from isaacsim.core.experimental.objects import GroundPlane

stage_utils.create_new_stage()                       # 等同 File > New
GroundPlane("/World/GroundPlane", positions=[0, 0, 0])  # 加一片地板
```

**解說：**

- `stage_utils.create_new_stage()`：程式化開新 stage，舊場景會被丟棄（未存檔的內容會消失）。
- USD 中一切都是 **prim**，每個 prim 都有一條路徑（如 `/World/GroundPlane`）。看右側 **Stage** 面板，你剛剛建立的 prim 就在樹裡。
- GUI 與程式做的事完全等價——這正是 Isaac Sim「三種工作流程可互換」的體現。

> 練習：執行後在 Stage 面板找到 GroundPlane，點選它並觀察 Property 面板的屬性。

---

## 第 2 課：燈光、幾何與材質

**開一個新分頁**（Tab > Add Tab），執行：

```python
from isaacsim.core.experimental.objects import DistantLight

distant_light = DistantLight("/DistantLight")
distant_light.set_intensities(300)
```

沒有光源時，就算有物體場景也是暗的。接著加兩顆帶顏色的方塊：

```python
from isaacsim.core.experimental.materials import PreviewSurfaceMaterial
from isaacsim.core.experimental.objects import Cube

yellow_material = PreviewSurfaceMaterial("/Materials/yellow")
yellow_material.set_input_values("diffuseColor", [1.0, 1.0, 0.0])

cyan_material = PreviewSurfaceMaterial("/Materials/cyan")
cyan_material.set_input_values("diffuseColor", [0.0, 1.0, 1.0])

visual_cube = Cube(paths="/visual_cube", positions=[0, 0.5, 0.5], sizes=0.3)
visual_cube.apply_visual_materials(yellow_material)

test_cube = Cube(paths="/test_cube", positions=[0, -0.5, 0.5], sizes=0.3)
test_cube.apply_visual_materials(cyan_material)
```

**解說：**

- 這兩顆是「**視覺方塊**」：沒有質量、沒有碰撞。按 **Play** 試試——它們懸浮在半空中一動不動。
- 材質也是 prim（放在 `/Materials/` 下），先建立材質再 `apply_visual_materials()` 綁定到物體。
- 想要玻璃或 PBR 材質，可改用 `OmniGlassMaterial`、`OmniPbrMaterial`（後者支援貼圖）。

> 練習：再加一顆紅色方塊 `/my_cube`，位置 `[0.5, 0, 0.5]`。提示：`diffuseColor` 設 `[1.0, 0.0, 0.0]`。

---

## 第 3 課：物理——讓方塊掉下來

物理屬性（質量、慣性）與碰撞屬性是**分開**的，可以只加其中之一；多數情況兩者一起加。開新分頁執行：

```python
from isaacsim.core.experimental.prims import GeomPrim, RigidPrim

RigidPrim(paths="/test_cube")                          # 加剛體（會受重力）
GeomPrim(paths="/test_cube", apply_collision_apis=True)  # 加碰撞（會撞到東西）
```

按 **Play**：青色方塊落下、撞到地板停住；黃色方塊依然懸浮。

**解說——Experimental API 的「包裝」哲學：**

- `Cube(...)` 建立幾何；`RigidPrim(paths)` 把剛體能力「疊」上去；`GeomPrim(paths, apply_collision_apis=True)` 疊上碰撞。
- 對既有物體（不管是誰建立的、GUI 拖進來的也一樣）都可以事後疊加，路徑對了就行。
- 想調碰撞近似法：`geom_prim.set_collision_approximations(["convexHull"])`（更緊密可用 `"convexDecomposition"`）。
- 想驗證碰撞網格：Viewport 左上「眼睛」圖示 > **Show By Type > Physics Mesh > All**，碰撞網格會以粉紅色線框顯示。
- 設質量：`RigidPrim(paths).set_masses([10.0])` 或以密度 `set_densities([1000.0])`。

> 練習：把第 2 課練習建立的 `/my_cube` 也變成會掉落的剛體。

---

## 第 4 課：移動、旋轉、縮放

按 **Stop** 停止模擬，然後執行：

```python
from isaacsim.core.experimental.prims import XformPrim

cube_prim = XformPrim(paths="/test_cube")
cube_prim.set_world_poses([1.5, 1.2, 1.0], [0.7, 0.7, 0, 1])  # 位置、四元數(wxyz)
cube_prim.set_local_scales([1, 1.5, 0.2])
```

不習慣四元數？用工具函式從歐拉角轉換：

```python
import isaacsim.core.experimental.utils.transform as transform_utils
from isaacsim.core.experimental.prims import XformPrim

orientation = transform_utils.euler_angles_to_quaternion([0.0, 45.0, 0.0], degrees=True)
XformPrim("/test_cube").set_world_poses(positions=[[0.0, 0.0, 1.5]], orientations=orientation)
```

讀取位姿（例如把 B 對齊到 A）：

```python
positions, orientations = XformPrim("/test_cube").get_world_poses()
XformPrim("/visual_cube").set_world_poses(positions=positions, orientations=orientations)
```

**解說：**

- `XformPrim` 是所有「有位姿的東西」的共同包裝，機器人底座也用它擺位置。
- 對照 GUI：這等同選取物體後按 W/E/R 拖曳 Gizmo，或在 Property 面板輸入數值。
- 四元數順序是 **wxyz**。`transform_utils` 還有 `quaternion_to_rotation_matrix()` 等轉換工具。

> 練習：讓黃色方塊每次執行時往 +X 移動 0.1。提示：先 `get_world_poses()` 讀出來、修改、再 `set_world_poses()` 寫回去。

---

## 第 5 課：載入 Franka 機械手臂

開新分頁，從官方雲端資產庫載入 Franka：

```python
import isaacsim.core.experimental.utils.stage as stage_utils
from isaacsim.core.experimental.prims import Articulation, XformPrim
from isaacsim.storage.native import get_assets_root_path

assets_root_path = get_assets_root_path()
asset_path = assets_root_path + "/Isaac/Robots/FrankaRobotics/FrankaPanda/franka.usd"
stage_utils.add_reference_to_stage(usd_path=asset_path, path="/World/Arm")

arm_transform = XformPrim("/World/Arm")
arm_transform.set_world_poses(positions=[0.0, 1.0, 0.0])

arm_handle = Articulation("/World/Arm")
```

**解說：**

- `get_assets_root_path()` 回傳官方資產伺服器根路徑（需網路連線；離線環境要設定本地資產包）。
- `add_reference_to_stage()` 是 USD 的 **Reference** 機制：不是複製整個機器人，而是「引用」外部 USD 檔到指定路徑——場景檔因此輕巧且能跟著原始資產更新。
- `Articulation` 是**關節機構**（機器人）的核心包裝類：查狀態、送命令都靠它。
- 變數 `arm_handle` 會留在共享環境裡，**後續課程的分頁直接使用**。

> 練習：把 `/Isaac/Robots/FrankaRobotics/FrankaPanda/franka.usd` 換成其他機器人載入試試（可先在 GUI 的 Create > Robots 選單觀察有哪些）。

---

## 第 6 課：查詢與控制關節

**先按 Play**（物理必須在跑），再於新分頁執行：

```python
# 查詢：需要 arm_handle（第 5 課建立）
print("Number of joints:", arm_handle.num_dofs)
print("Joint names:", arm_handle.dof_names)
print("Joint positions:", arm_handle.get_dof_positions())
```

送出關節位置命令，讓手臂擺出姿勢：

```python
# Franka 共 9 DOF：7 個手臂關節 + 2 個夾爪指關節
arm_handle.set_dof_positions([-1.5, 0.0, 0.0, -1.5, 0.0, 1.5, 0.5, 0.04, 0.04])

# 回到預設姿勢：
# arm_handle.set_dof_positions([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.04, 0.04])
```

更多控制模式（以 GUI 建立、位於 `/Franka` 的機器人為例）：

```python
import numpy as np
from isaacsim.core.experimental.prims import Articulation

articulation = Articulation("/World/Arm")

# 位置目標（隨機姿勢）
articulation.set_dof_position_targets(np.random.rand(9) * 2 - 1)

# 只控制單一關節：開合夾爪（finger_joint2 與 1 連動）
articulation.set_dof_position_targets(
    0.04, dof_indices=articulation.get_dof_indices("panda_finger_joint1"))

# 切換到速度控制
articulation.switch_dof_control_mode("velocity")
articulation.set_dof_velocity_targets(
    0.25, dof_indices=articulation.get_dof_indices("panda_joint4"))

# 切換到力矩控制
articulation.switch_dof_control_mode("effort")
articulation.set_dof_efforts(100 * (np.random.rand(9) * 2 - 1))
```

**解說與注意：**

- **所有讀寫關節的 API 都要在 Play 中執行**，否則會失敗或拿到無效資料。
- 按一次 Run 只執行一次——模擬繼續跑，但你的命令不會重複。連續控制要靠下一課的 callback。
- 隨機目標可能不符合機器人的運動學限制，僅供練習觀察。
- 路徑支援正規表達式：`Articulation("/World/Franka_.*")` 可一次包裝多台同型機器人做批次控制（見官方 [Robot Simulation Snippets](https://docs.isaacsim.omniverse.nvidia.com/latest/python_scripting/robots_simulation.html)）。

> 練習：寫一段程式印出每個關節的名稱與目前位置，一行一個，格式如 `panda_joint1: 0.012`。

---

## 第 7 課：物理回呼——每一步都做事

想「每個物理步都印出關節位置」？註冊 **POST_PHYSICS_STEP** 回呼：

```python
from isaacsim.core.simulation_manager import IsaacEvents, SimulationManager

def print_joint_positions_callback(dt, context):
    positions = arm_handle.get_dof_positions()
    print("Joint positions:", positions)

# 保留 callback_id，之後才能移除
callback_id = SimulationManager.register_callback(
    print_joint_positions_callback, IsaacEvents.POST_PHYSICS_STEP)
```

按 **Play**，觀察終端機（不是輸出區）以每個物理步的頻率洗版。夠了就取消註冊：

```python
from isaacsim.core.simulation_manager import SimulationManager

SimulationManager.deregister_callback(callback_id)
```

**解說：**

- 這就是 Extension 工作流程處理「連續邏輯」的標準模式：主環境非同步，週期性工作交給 callback。
- callback 簽名是 `(dt, context)`，`dt` 為該步的時間間隔。
- 同樣手法可以做**連續控制**：在 callback 裡呼叫 `set_dof_position_targets()`，實作簡單的軌跡跟隨。
- 對照組：**Standalone 腳本**則是自己寫 `for` 迴圈呼叫 `SimulationManager.step()`，把控制程式碼放進迴圈——同一套 API、不同的時間主導權。

> 練習：註冊一個 callback，讓 `panda_joint1` 的位置目標隨時間以正弦波擺動。提示：用一個全域變數累加 `dt`，`target = 0.5 * math.sin(t)`。

---

## 第 8 課：非同步任務——程式化控制時間軸

Script Editor 中無法「阻塞等待」模擬走幾步（會卡死 UI），正確做法是 `asyncio`：

```python
import asyncio
import omni

# 播放，等一個 frame，然後暫停
async def pause_sim(task):
    done, pending = await asyncio.wait({task})
    if task in done:
        print("Waited until next frame, pausing")
        omni.timeline.get_timeline_interface().pause()

omni.timeline.get_timeline_interface().play()
task = asyncio.ensure_future(omni.kit.app.get_app().next_update_async())
asyncio.ensure_future(pause_sim(task))
```

Experimental API 也提供更精簡的 `app_utils`；下面示範「建場景 → 播放 → 等 10 步 → 讀接觸力 → 停止」一氣呵成：

```python
import asyncio
import isaacsim.core.experimental.utils.app as app_utils
import isaacsim.core.experimental.utils.stage as stage_utils
from isaacsim.core.experimental.objects import Cube, GroundPlane
from isaacsim.core.experimental.prims import GeomPrim, RigidPrim

async def demo():
    stage_utils.define_prim("/World/physicsScene", "PhysicsScene")
    GroundPlane("/World/groundPlane")
    cube = Cube("/World/drop_cube", positions=[0.0, 0.0, 2.0], sizes=0.3)
    GeomPrim(cube.paths, apply_collision_apis=True)
    rigid = RigidPrim(cube.paths, masses=[1.0])

    app_utils.play()
    await app_utils.update_app_async(steps=10)   # 等 10 個更新
    print("落下中位置：", rigid.get_world_poses()[0].numpy())
    app_utils.stop()

asyncio.ensure_future(demo())
```

**解說：**

- `omni.timeline.get_timeline_interface()` 的 `play()/pause()/stop()` 等同按 Viewport 左側的按鈕。
- `await app_utils.update_app_async(steps=N)` 讓協程「讓出控制權」等 N 個更新——UI 不會卡住。
- 張量後端（tensor-backed）的物理 API（讀位姿、速度、接觸力等）**必須在 timeline 播放後才有效**，這也是為什麼官方片段常包在 `async def` + `app_utils.play()` 裡。

> 練習：改寫 demo，讓方塊落地後（等 60 步）印出最終高度，驗證它停在地板上。

---

## 第 9 課：場景查詢——射線與重疊測試

物理引擎不只會演，還能「問」。前提：場景有 physics scene、物體有碰撞網格、**Play 中**。

**Raycast（射線）**——找出射線最先打到的物體並塗黃：

```python
import carb
import omni
from omni.physx import get_physx_scene_query_interface
from pxr import Gf, UsdGeom, Vt

def check_raycast():
    origin = carb.Float3(0.0, 0.0, 0.5)
    ray_dir = carb.Float3(1.0, 0.0, 0.0)
    distance = 100.0
    hit = get_physx_scene_query_interface().raycast_closest(origin, ray_dir, distance)
    if hit["hit"]:
        usd_geom = UsdGeom.Mesh.Get(omni.usd.get_context().get_stage(), hit["rigidBody"])
        usd_geom.GetDisplayColorAttr().Set(Vt.Vec3fArray([Gf.Vec3f(1.0, 1.0, 0.0)]))
        return usd_geom.GetPath().pathString, hit["distance"]
    return None, 10000.0

print(check_raycast())
```

**Overlap（重疊）**——偵測與指定立方體區域重疊的物體並塗紅：

```python
import carb
import omni
from omni.physx import get_physx_scene_query_interface
from pxr import Gf, UsdGeom, Vt

def report_hit(hit):
    usd_geom = UsdGeom.Mesh.Get(omni.usd.get_context().get_stage(), hit.rigid_body)
    usd_geom.GetDisplayColorAttr().Set(Vt.Vec3fArray([Gf.Vec3f(180/255, 16/255, 0.0)]))
    return True  # 回傳 True 繼續回報下一個

def check_overlap():
    extent = carb.Float3(0.5, 0.5, 0.5)
    origin = carb.Float3(0.0, 0.0, 0.0)
    rotation = carb.Float4(0.0, 0.0, 1.0, 0.0)
    num_hits = get_physx_scene_query_interface().overlap_box(
        extent, origin, rotation, report_hit, False)
    return num_hits > 0

print(check_overlap())
```

**解說：**

- 這是實作簡易感測器（近接偵測、視線判斷）與抓取邏輯（判斷夾爪附近有什麼）的基石。
- 射線起點／方向可以換成即時的相機或機器人末端位姿。
- 更完整的接觸力資訊（摩擦力、法向力、接觸點）可透過 `RigidPrim` 的 contact filter API 取得，見官方 [Scene Setup Snippets](https://docs.isaacsim.omniverse.nvidia.com/latest/python_scripting/environment_setup.html#create-rigidprim-with-contact-filters)。

> 練習：從 `/World/Arm` 手臂基座位置往 -Y 方向發射線，偵測前方有沒有東西。

---

## 第 10 課：綜合練習——全自動小場景

把所學整合成一個腳本：建場景 → 擺機器人 → 播放 → 揮手 → 存檔。**開新 stage 後**在單一分頁貼上執行：

```python
import asyncio
import isaacsim.core.experimental.utils.app as app_utils
import isaacsim.core.experimental.utils.stage as stage_utils
from isaacsim.core.experimental.materials import PreviewSurfaceMaterial
from isaacsim.core.experimental.objects import Cube, DistantLight, GroundPlane
from isaacsim.core.experimental.prims import Articulation, GeomPrim, RigidPrim
from isaacsim.storage.native import get_assets_root_path

async def build_and_run():
    # 1. 場景基礎
    stage_utils.create_new_stage()
    stage_utils.define_prim("/World/physicsScene", "PhysicsScene")
    GroundPlane("/World/GroundPlane", positions=[0, 0, 0])
    DistantLight("/World/Light").set_intensities(500)

    # 2. 一顆會掉落的紅色方塊
    red = PreviewSurfaceMaterial("/Materials/red")
    red.set_input_values("diffuseColor", [1.0, 0.0, 0.0])
    cube = Cube("/World/box", positions=[0.4, 0.0, 1.0], sizes=0.05)
    cube.apply_visual_materials(red)
    GeomPrim(cube.paths, apply_collision_apis=True)
    RigidPrim(cube.paths, masses=[0.1])

    # 3. 載入 Franka
    asset = get_assets_root_path() + "/Isaac/Robots/FrankaRobotics/FrankaPanda/franka.usd"
    stage_utils.add_reference_to_stage(usd_path=asset, path="/World/Arm")
    arm = Articulation("/World/Arm")

    # 4. 播放並讓手臂輪流擺兩個姿勢
    app_utils.play()
    await app_utils.update_app_async(steps=10)
    for pose in (
        [-1.5, 0.0, 0.0, -1.5, 0.0, 1.5, 0.5, 0.04, 0.04],
        [0.0, -0.5, 0.0, -2.0, 0.0, 2.0, 0.8, 0.0, 0.0],
    ):
        arm.set_dof_position_targets(pose)
        await app_utils.update_app_async(steps=120)
        print("目前關節位置：", arm.get_dof_positions().numpy())
    app_utils.stop()

    # 5. 存檔
    import omni, tempfile
    from pathlib import Path
    out = Path(tempfile.gettempdir()) / "my_first_scene.usd"
    omni.usd.get_context().save_as_stage(str(out), None)
    print(f"場景已存至 {out}")

asyncio.ensure_future(build_and_run())
```

**驗收清單**：地板與光源出現 → 紅色小方塊落到地面 → 手臂連續擺出兩個姿勢 → 終端機印出關節位置 → 印出 USD 存檔路徑。

**延伸挑戰：**

1. 在手臂前方放一排方塊，用第 9 課的 raycast 從末端執行器偵測它們。
2. 用第 7 課的 callback 讓手臂持續做正弦擺動，方塊落在手臂上觀察互動。
3. 把存出來的 USD 用 **File > Open** 重新載入，驗證場景完整保存。

---

## 常見錯誤與除錯指南

| 症狀 | 原因與解法 |
|---|---|
| 讀關節狀態回傳錯誤／無效值 | **模擬沒在 Play**。先按 Play 再執行；或用 `app_utils.play()` |
| `NameError: arm_handle is not defined` | 依賴前面分頁建立的變數，但 stage 已重開或還沒執行該分頁。分頁共享環境，但變數不會自動重建 |
| 重複執行報 prim 已存在 | 同一路徑重複建立。先 File > New（或 `create_new_stage()`），或換路徑 |
| 程式跑了但場景沒變化 | 檢查是不是只選取了部分程式（反白執行只跑選取段） |
| callback 的 print 看不到 | 輸出在**終端機**，不是 Script Editor 輸出區 |
| callback 停不下來 | 用註冊時回傳的 `callback_id` 呼叫 `SimulationManager.deregister_callback()`；沒存到 id 就重啟模擬 |
| `get_assets_root_path()` 失敗或載入機器人卡住 | 資產庫需要網路；受限網路請設定[本地資產包](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/install_faq.html) |
| 舊教學程式碼 import 失敗（`omni.isaac.core` 等） | 4.5 → 6.0 擴充功能改名、Core API 改版。對照[遷移指南](https://docs.isaacsim.omniverse.nvidia.com/latest/migration_guides/index.html)改用 `isaacsim.core.experimental.*` |
| UI 卡死 | 腳本裡有阻塞呼叫（如 `time.sleep` 長迴圈）。改用 `asyncio` + `update_app_async()`（第 8 課） |

---

## 附錄：常用 API 速查表

```python
# ── Stage ──────────────────────────────────────────────
import isaacsim.core.experimental.utils.stage as stage_utils
stage_utils.create_new_stage()                      # 新 stage
stage_utils.add_reference_to_stage(usd_path, path)  # 引用外部 USD
stage_utils.define_prim(path, "PhysicsScene")       # 定義 prim
stage_utils.get_current_stage()                     # 取得目前 stage

# ── 物件 ──────────────────────────────────────────────
from isaacsim.core.experimental.objects import Cube, GroundPlane, DistantLight, Cone, Mesh
Cube(paths, positions=..., sizes=..., scales=..., colors=...)

# ── 能力疊加 ──────────────────────────────────────────
from isaacsim.core.experimental.prims import XformPrim, GeomPrim, RigidPrim, Articulation
XformPrim(p).set_world_poses(pos, quat_wxyz)        # 位姿
GeomPrim(p, apply_collision_apis=True)              # 碰撞
RigidPrim(p, masses=[1.0])                          # 剛體
Articulation(p)                                     # 關節機構

# ── 關節控制（Play 中） ────────────────────────────────
arm.num_dofs; arm.dof_names
arm.get_dof_positions(); arm.get_dof_velocities(); arm.get_dof_efforts()
arm.set_dof_positions([...]); arm.set_dof_position_targets([...])
arm.switch_dof_control_mode("velocity" | "effort")
arm.get_dof_indices("joint_name")

# ── 模擬管理 ──────────────────────────────────────────
import isaacsim.core.experimental.utils.app as app_utils
app_utils.play(); app_utils.stop()
await app_utils.update_app_async(steps=N)
from isaacsim.core.simulation_manager import SimulationManager, IsaacEvents, PhysxScene
cb_id = SimulationManager.register_callback(fn, IsaacEvents.POST_PHYSICS_STEP)
SimulationManager.deregister_callback(cb_id)
PhysxScene("/World/physicsScene").set_gravity([0, 0, -9.81])

# ── 轉換工具 ──────────────────────────────────────────
import isaacsim.core.experimental.utils.transform as transform_utils
transform_utils.euler_angles_to_quaternion([r, p, y], degrees=True)
transform_utils.quaternion_to_rotation_matrix(quat)

# ── 資產與存檔 ────────────────────────────────────────
from isaacsim.storage.native import get_assets_root_path
get_assets_root_path()                              # 官方資產庫根路徑
import omni
omni.usd.get_context().save_as_stage(path, None)    # 存 USD
omni.usd.get_context().get_stage()                  # 原生 USD stage
omni.timeline.get_timeline_interface().play()       # 時間軸控制
```

**延伸閱讀**：[Python Scripting 總覽](https://docs.isaacsim.omniverse.nvidia.com/latest/python_scripting/index.html)｜[Core API 教學系列](https://docs.isaacsim.omniverse.nvidia.com/latest/core_api_tutorials/index.html)｜[API 參考](https://docs.isaacsim.omniverse.nvidia.com/latest/reference_python_api.html)｜[官方 Script Editor 頁面](https://docs.isaacsim.omniverse.nvidia.com/latest/development_tools/omniverse_script_editor.html)

---

*本教學由 Claude 依據 Isaac Sim 6.0.1 官方文檔設計；官方程式片段經整理改編，執行環境如有差異請以官方文檔為準。*
