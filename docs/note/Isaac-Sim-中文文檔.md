# NVIDIA Isaac Sim 中文文檔（整理版）

> 本文檔整理自 [Isaac Sim 官方文檔](https://docs.isaacsim.omniverse.nvidia.com/latest/index.html)（版本 **6.0.1**，官方最後更新：2026-06-22）。
> 內容為中文摘要與重點整理，各章節均附上官方原文連結以便深入查閱。
> 搭配教學請見同資料夾的《[Script Editor 實戰教學](./Script-Editor-教學.md)》。

---

## 目錄

1. [什麼是 Isaac Sim](#1-什麼是-isaac-sim)
2. [系統需求](#2-系統需求)
3. [安裝](#3-安裝)
4. [快速入門](#4-快速入門)
5. [核心概念](#5-核心概念)
6. [Python 腳本開發](#6-python-腳本開發)
7. [機器人與感測器模擬](#7-機器人與感測器模擬)
8. [生態系與進階主題](#8-生態系與進階主題)
9. [實用資源](#9-實用資源)
10. [官方文檔章節對照表](#10-官方文檔章節對照表)

---

## 1. 什麼是 Isaac Sim

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/index.html)

**NVIDIA Isaac Sim** 是一款建立在 Omniverse Kit 之上的開源機器人模擬器（Apache 2.0 授權），核心能力包括：

- 從 **URDF、MJCF、Onshape CAD 或 USD** 匯入機器人與場景。
- 使用 **PhysX** 或 **Newton** 物理引擎進行模擬。
- 加入 **RTX 感測器**（光達、雷達等）與**物理式感測器**（IMU、接觸感測器等）。
- 產生**合成資料（Synthetic Data）** 用於訓練感知模型。
- 為 **Isaac Lab** 準備機器人資產以進行強化學習訓練。
- 透過 **ROS 2** 進行軟體在環（Software-in-the-Loop, SIL）驗證。

### 技術堆疊

| 元件 | 角色 |
|---|---|
| **OpenUSD** | 統一的場景描述格式，從資產匯入到部署共用一套表示法 |
| **RTX** | 即時光線追蹤渲染器 |
| **PhysX / Newton** | 可切換的物理引擎後端 |
| **OmniGraph** | 視覺化編程（節點圖）框架 |
| **Replicator** | 合成資料生成（SDG）框架 |

### 典型工作流程（Simulation Development Loop）

1. **匯入（Import）**：場景、機器人、感測器、CAD/USD/NuRec 資產。
2. **配置（Configure）**：材質、感測器、語意標註、隨機化、物理調校、通訊圖。
3. **模擬（Simulate）**：物理步進、感測器輸出、標註擷取、控制迴圈。
4. **連接／部署（Connect / Deploy）**：輸出資料集到訓練管線，或連接外部機器人堆疊做上機前驗證。

### 在 NVIDIA 機器人生態系中的定位

- **Isaac Sim**：建立場景、rig 機器人、執行 SIL 測試。
- **Isaac Lab**：以平行環境訓練 RL／模仿學習策略。
- **Lab-Arena**：大規模評測策略。
- **NuRec**：以 Gaussian Splatting 重建真實環境並以 USD 載入。
- **Cosmos Transfer**：將渲染影像轉換為多樣化的擬真影像（照片級增強）。

---

## 2. 系統需求

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/requirements.html)

### x86_64 平台

| 項目 | 最低配置 | 建議配置 | 理想配置 |
|---|---|---|---|
| 作業系統 | Ubuntu 22.04/24.04、Windows 11 | 同左 | 同左 |
| CPU | Intel i7（7 代）／AMD Ryzen 5 | i7（9 代）／Ryzen 7 | i9 X 系列／Ryzen 9、Threadripper |
| 核心數 | 4 | 8 | 16 |
| 記憶體 | 32 GB | 64 GB | 64 GB |
| 儲存空間 | 50 GB SSD | 500 GB SSD | 1 TB NVMe SSD |
| GPU | GeForce RTX 4080 | GeForce RTX 5080 | RTX PRO 6000 Blackwell |
| VRAM | 16 GB | 16 GB | 48 GB |

**重要注意事項：**

- **Windows 10 不支援**（微軟已於 2025-10-14 終止支援）。
- **不支援無 RT Core 的 GPU**（例如 A100、H100）。
- 容器（Docker）版**僅支援 Linux**。
- 需要網路連線以存取線上資產庫（預設資產來源需允許對 `omniverse-content-production.s3-us-west-2.amazonaws.com` 的 HTTPS 連出）。
- 進階用途（多感測器、Isaac Lab 訓練）需要更多 RAM／VRAM。
- 安裝後可執行 **Isaac Sim Compatibility Checker** 輕量工具檢查硬體相容性。

### aarch64 平台

目前僅支援 **NVIDIA DGX Spark**（DGX OS 7）；已知限制：cuRobo 與 cuMotion 不支援。

---

## 3. 安裝

[安裝總覽](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/index.html)

### 3.1 快速安裝（Quick Install）— 推薦新手

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/quick-install.html)

1. 從 [下載頁面](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/download.html) 下載對應平台的 standalone 壓縮包。
2. 解壓並執行：

   **Windows：**
   ```bat
   mkdir C:\isaacsim
   cd %USERPROFILE%/Downloads
   tar -xvzf "isaac-sim-standalone-6.0.1-windows-x86_64.zip" -C C:\isaacsim
   cd C:\isaacsim
   post_install.bat
   isaac-sim.bat
   ```

   **Linux (x86_64)：**
   ```bash
   mkdir ~/isaacsim
   cd ~/Downloads
   unzip "isaac-sim-standalone-6.0.1-linux-x86_64.zip" -d ~/isaacsim
   cd ~/isaacsim
   ./post_install.sh
   ./isaac-sim.sh
   ```

3. 首次啟動需等待數分鐘（著色器快取暖機），請觀察終端機直到出現最終載入訊息。
4. 驗收：選單 **Create > Environment > Simple Room**，再 **Create > Robots > Franka Emika Panda Arm**，按左側 **Play** 播放模擬。

> 注意：保留至少 **50 GB** 可用磁碟空間；下載包＋解壓安裝過程可能暫時佔用約 40 GB。

### 3.2 其他安裝方式

| 方式 | 適用情境 | 連結 |
|---|---|---|
| Workstation 安裝 | 完整桌面應用與本機相依套件 | [連結](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/install_workstation.html) |
| 容器（Docker）安裝 | 可重現的環境、CI，僅限 Linux | [連結](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/install_container.html) |
| Python 環境安裝（pip/conda） | Python 優先的開發流程 | [連結](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/install_python.html)、[PyPI](https://pypi.org/project/isaacsim/) |
| 雲端部署 | AWS / Azure / GCP / Brev 等 | [連結](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/install_cloud.html) |
| 遠端／無頭模式 | 執行 `isaac-sim.streaming.sh(.bat)` 並以 [WebRTC 串流用戶端](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/manual_livestream_clients.html) 連線 | — |
| ROS 2 安裝 | 搭配 ROS 2 使用 | [連結](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/install_ros.html) |

安裝疑難排解請見 [Setup Tips](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/install_faq.html) 與 [Troubleshooting](https://docs.isaacsim.omniverse.nvidia.com/latest/overview/troubleshooting.html)。

---

## 4. 快速入門

### 4.1 基礎使用教學（Basic Usage Tutorial）

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/introduction/quickstart_isaacsim.html)

此教學以**同一個目標**（從空白 stage 到會動的方塊）示範三種工作流程，方便對照學習：

**GUI 流程重點：**

1. **File > New** 建立新場景。
2. **Create > Physics > Ground Plane** 加入地板。
3. **Create > Lights > Distant Light** 加入光源（場景中沒有物體反射光線時仍會是暗的）。
4. **Create > Shape > Cube** 加入「視覺方塊」（無質量、無碰撞，Play 後不會有任何反應）。
5. 操作 Gizmo：**W** 移動、**E** 旋轉、**R** 縮放、**Esc** 取消選取；可切換局部／世界座標。精確數值可在 **Property** 面板輸入。
6. 加物理：在 Stage 樹選取 `/World/Cube` → **Property 面板 > Add > Physics > Rigid Body with Colliders Preset** → 按 **Play** 觀察方塊受重力落下並與地板碰撞。

**Extension（Script Editor）流程**：以 **Window > Script Editor** 執行 Python 片段完成同樣事情——詳見《[Script Editor 實戰教學](./Script-Editor-教學.md)》。

**Standalone Python 流程**：執行內建腳本
`standalone_examples/tutorials/getting_started/getting_started.py`：

```bash
# Linux
./python.sh standalone_examples/tutorials/getting_started/getting_started.py
# Windows
python.bat standalone_examples\tutorials\getting_started\getting_started.py
```

### 4.2 基礎機器人教學（Basic Robot Tutorial）

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/introduction/quickstart_isaacsim_robot.html)

**GUI 流程重點：**

1. **Create > Robots > Franka Emika Panda Arm** 將機器人加入場景。
2. **Tools > Physics > Physics Inspector** 檢視關節上下限、預設姿態、剛性（stiffness）與阻尼（damping）。
3. **Tools > Robotics > OmniGraph Controllers > Joint Position** 產生關節位置控制圖（OmniGraph）。
4. 選取 **JointCommandArray** 節點，按 **Play** 後在 Property 面板拖曳／輸入關節值即可讓手臂動作。
5. 可用 **Window > Graph Editors > Action Graph** 視覺化檢視生成的控制圖。

**Python 對應**（Extension 或 Standalone 皆同一套 API）：

```python
import isaacsim.core.experimental.utils.stage as stage_utils
from isaacsim.core.experimental.prims import Articulation, XformPrim
from isaacsim.storage.native import get_assets_root_path

assets_root_path = get_assets_root_path()
asset_path = assets_root_path + "/Isaac/Robots/FrankaRobotics/FrankaPanda/franka.usd"
stage_utils.add_reference_to_stage(usd_path=asset_path, path="/World/Arm")

arm_handle = Articulation("/World/Arm")
# （模擬 Play 中）送出關節位置命令：Franka 共 9 DOF（7 臂關節 + 2 指關節）
arm_handle.set_dof_positions([-1.5, 0.0, 0.0, -1.5, 0.0, 1.5, 0.5, 0.04, 0.04])
```

### 4.3 範例瀏覽器

- **互動式（Extension）範例**：**Window > Examples > Robotics Examples**（[參考表](https://docs.isaacsim.omniverse.nvidia.com/latest/introduction/menu_examples.html)）。
- **Standalone 範例**：安裝根目錄的 `standalone_examples/` 資料夾（[參考清單](https://docs.isaacsim.omniverse.nvidia.com/latest/introduction/standalone_examples_list.html)）。

---

## 5. 核心概念

### 5.1 三種工作流程（Workflows）

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/introduction/workflows.html)

| 工作流程 | 主要特性 | 建議用途 |
|---|---|---|
| **GUI** | 視覺化、直覺、專門的場景建構工具 | 建構世界、組裝機器人、掛載感測器、OmniGraph 視覺編程、初始化 ROS bridge |
| **Extension** | 非同步執行、**熱重載（hot reload）**、自適應物理步進 | 測試 Python 片段（Script Editor）、互動式 GUI 工具、即時性應用 |
| **Standalone Python** | 可**手動控制物理／渲染步進**、支援無頭（headless）模式 | 大規模 RL 訓練、系統性場景生成與修改 |

**關鍵差異——時間步進：**

- **Extension（含 Script Editor）**：Python 與渲染／物理**非同步**並行。Viewport 開啟即開始渲染；按 **Play** 才開始物理步進。要在每個物理步做事必須註冊 callback。
- **Standalone**：在腳本中**顯式呼叫** `SimulationManager.step()`／`RenderingManager.render()`，可保證「命令完成後才步進」，適合訓練與需要精準時序（如 ROS 發布頻率）的場合。

三種流程**可以混用**：GUI 建好的東西存成 USD 後，可在 standalone 腳本載入並程式化修改。

**熱重載（Hot Reloading）**：Python Extension 程式碼修改存檔後，變更立即反映在執行中的 Isaac Sim，不需重啟——快速迭代的利器。

### 5.2 Application／Simulation／World／Scene／Stage

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/python_scripting/core_api_overview.html)

USD 中的一切都是帶屬性的 **prim（primitive）**。

| 概念 | 說明 |
|---|---|
| **Simulation** | 透過程式化改變 prim 屬性使其隨時間演進 |
| **Application** | 管理模擬的宏觀面向（渲染方式、使用者互動、GUI） |
| **Stage** | USD 概念：定義 prim 的邏輯與關係脈絡（prim 不能脫離 stage 存在） |
| **Scene** | 當前呈現的道具與角色的組合 |
| **World** | 為模擬提供脈絡：管理哪些 prim 與時間流相關、管理 scene |

官方比喻：去劇院看戲——**劇院**是 Application、**戲本身**是 Simulation、**舞台**是 Stage、幕啟後看到的**一幕**是 Scene、後台工作人員與機關則是 **World**。

### 5.3 Core API 與 Core Experimental API

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/python_scripting/core_api_overview.html)

> **重要**：Isaac Sim 5.0 起引入 **Core Experimental API**（`isaacsim.core.experimental.*`），為 Core API 的重寫版，未來將成為所有 Isaac Sim 原始碼的基礎 API；**現行 Core API 將被棄用並移除**。官方強烈建議儘早採用 Experimental API（本文檔所有範例均使用之）。

Core API 是**針對機器人應用封裝**的 USD／物理引擎 API 包裝層。同樣「加一個帶物理的方塊」：

原生 USD API（冗長但控制精細）需要 20 多行設定 PhysicsScene、UsdGeom.Cube、RigidBodyAPI、CollisionAPI；Core API 只需：

```python
import numpy as np
from isaacsim.core.api.objects import DynamicCuboid

DynamicCuboid(
    prim_path="/new_cube_2",
    name="cube_1",
    position=np.array([0, 0, 1.0]),
    scale=np.array([0.6, 0.5, 0.2]),
    size=1.0,
    color=np.array([255, 0, 0]),
)
```

**Experimental API 的核心模組：**

| 模組 | 內容 |
|---|---|
| `isaacsim.core.experimental.objects` | `Cube`、`Cone`、`Mesh`、`GroundPlane`、`DistantLight` 等場景物件 |
| `isaacsim.core.experimental.prims` | `XformPrim`（位姿）、`GeomPrim`（碰撞）、`RigidPrim`（剛體）、`Articulation`（關節機構）等包裝類 |
| `isaacsim.core.experimental.materials` | `PreviewSurfaceMaterial`、`OmniPbrMaterial`、`OmniGlassMaterial`、`RigidBodyMaterial` |
| `isaacsim.core.experimental.utils` | `stage`（stage 操作）、`app`（play/stop/update）、`transform`（歐拉角↔四元數）、`bounds`、`semantics` |
| `isaacsim.core.simulation_manager` | `SimulationManager`（步進、callback、物理引擎設定）、`PhysxScene`、`IsaacEvents` |
| `isaacsim.storage.native` | `get_assets_root_path()` 取得官方資產庫根路徑 |

**設計模式**：先建幾何（`Cube`），再用包裝類「疊加」能力——`GeomPrim(paths, apply_collision_apis=True)` 加碰撞、`RigidPrim(paths)` 加剛體。包裝類支援**正規表達式路徑**（如 `"/World/Franka_.*"`）做向量化批次操作。

### 5.4 OpenUSD 基礎

[OpenUSD Fundamentals](https://docs.isaacsim.omniverse.nvidia.com/latest/omniverse_usd/open_usd.html)｜[Working with USD](https://docs.isaacsim.omniverse.nvidia.com/latest/omniverse_usd/intro_to_usd.html)

- USD（Universal Scene Description）是 Pixar 開發的場景描述格式與運行時，Isaac Sim 的一切場景資料都以 USD 表示。
- 常用原生入口：`omni.usd.get_context().get_stage()` 取得目前 stage；`stage.Traverse()` 走訪所有 prim；`pxr` 套件（`Usd`、`UsdGeom`、`UsdPhysics`、`Gf` 等）提供完整低階 API。
- 機器人／感測器結構的 USD 規範見 [Robot Schema](https://docs.isaacsim.omniverse.nvidia.com/latest/omniverse_usd/robot_schema.html) 與 [Sensor Schema](https://docs.isaacsim.omniverse.nvidia.com/latest/omniverse_usd/sensor_schema.html)。

---

## 6. Python 腳本開發

[總覽](https://docs.isaacsim.omniverse.nvidia.com/latest/python_scripting/index.html)

### 6.1 兩種 Python 執行形態

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/python_scripting/python_scripting_concepts.html)

- **互動式（Interactive）**：在 Script Editor／Python 主控台中執行，用於探索 API 與測試片段。
- **獨立式（Standalone）**：從命令列執行，用於自動化任務與跑模擬。

兩者共用同一套 API，皆可用來開發自訂擴充（客製控制器、感測器等）。

### 6.2 開發工具

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/development_tools/index.html)

| 工具 | 用途 | 連結 |
|---|---|---|
| **Script Editor** | Kit 內建 Python 編輯執行環境，直接與 stage 互動 | [連結](https://docs.isaacsim.omniverse.nvidia.com/latest/development_tools/omniverse_script_editor.html) |
| VS Code | 開發與[除錯](https://docs.isaacsim.omniverse.nvidia.com/latest/utilities/debugging/tutorial_advanced_python_debugging.html) | [連結](https://docs.isaacsim.omniverse.nvidia.com/latest/development_tools/vscode.html) |
| Jupyter Notebook | 互動式筆記本開發 | [連結](https://docs.isaacsim.omniverse.nvidia.com/latest/development_tools/jupyter_notebook.html) |
| Python Server | 遠端程式碼執行 | [連結](https://docs.isaacsim.omniverse.nvidia.com/latest/development_tools/python_server.html) |
| Isaac Sim MCP Server | 讓 AI 助手（如 Claude）操作 Isaac Sim | [連結](https://docs.isaacsim.omniverse.nvidia.com/latest/development_tools/isaac_sim_mcp.html) |
| Carb Settings | 修改底層設定 | [連結](https://docs.isaacsim.omniverse.nvidia.com/latest/development_tools/carb_settings.html) |

### 6.3 Standalone 應用骨架

[Python Environment](https://docs.isaacsim.omniverse.nvidia.com/latest/python_scripting/manual_standalone_python.html)

```python
from isaacsim import SimulationApp

# 必須最先建立 SimulationApp，之後才能 import 其他 isaacsim 模組
simulation_app = SimulationApp({"headless": False})  # headless=True 則不開 GUI

import isaacsim.core.experimental.utils.stage as stage_utils
from isaacsim.core.experimental.objects import GroundPlane
from isaacsim.core.experimental.prims import Articulation
from isaacsim.core.rendering_manager import RenderingManager
from isaacsim.core.simulation_manager import SimulationManager
from isaacsim.storage.native import get_assets_root_path

stage_utils.create_new_stage()
GroundPlane("/World/GroundPlane", positions=[0, 0, 0])

asset_path = get_assets_root_path() + "/Isaac/Robots/FrankaRobotics/FrankaPanda/franka.usd"
stage_utils.add_reference_to_stage(usd_path=asset_path, path="/World/Arm")
arm = Articulation("/World/Arm")

# 顯式步進迴圈——standalone 工作流程的核心
arm.set_dof_positions([-1.5, 0.0, 0.0, -1.5, 0.0, 1.5, 0.5, 0.04, 0.04])
for _ in range(100):
    SimulationManager.step()
    RenderingManager.render()
    simulation_app.update()
    print("Joint positions:", arm.get_dof_positions())
```

### 6.4 常用程式片段（官方 Snippets 精選）

完整片段見 [Scene Setup Snippets](https://docs.isaacsim.omniverse.nvidia.com/latest/python_scripting/environment_setup.html)、[Util Snippets](https://docs.isaacsim.omniverse.nvidia.com/latest/python_scripting/util_snippets.html)、[Robot Simulation Snippets](https://docs.isaacsim.omniverse.nvidia.com/latest/python_scripting/robots_simulation.html)。

**建立物理場景與設定重力：**

```python
from isaacsim.core.simulation_manager import PhysxScene

physics_scene = PhysxScene("/World/physicsScene")
physics_scene.set_gravity([0.0, 0.0, -9.81])
```

**建立剛體方塊＋地板：**

```python
import isaacsim.core.experimental.utils.stage as stage_utils
import numpy as np
from isaacsim.core.experimental.objects import Cube, GroundPlane
from isaacsim.core.experimental.prims import GeomPrim, RigidPrim

stage_utils.define_prim("/World/physicsScene", "PhysicsScene")
GroundPlane("/World/groundPlane", sizes=10, colors=np.array([0.5, 0.5, 0.5]), templates=None)
cube = Cube("/World/cube", positions=np.array([-0.5, -0.2, 1.0]),
            scales=np.array([0.5, 0.5, 0.5]), colors=np.array([0.2, 0.3, 0.0]))
RigidPrim(cube.paths, masses=[1.0])
GeomPrim(cube.paths, apply_collision_apis=True)
```

**設定世界位姿（歐拉角轉四元數）：**

```python
import isaacsim.core.experimental.utils.transform as transform_utils
from isaacsim.core.experimental.prims import XformPrim

orientation = transform_utils.euler_angles_to_quaternion([0.0, 290.0, 0.0], degrees=True)
XformPrim("/World/Cube").set_world_poses(positions=[[0.10, 1.0, 1.5]], orientations=orientation)
```

**射線偵測（Raycast）：**

```python
import carb
from omni.physx import get_physx_scene_query_interface

origin = carb.Float3(0.0, 0.0, 0.0)
ray_dir = carb.Float3(1.0, 0.0, 0.0)
hit = get_physx_scene_query_interface().raycast_closest(origin, ray_dir, 100.0)
if hit["hit"]:
    print(hit["rigidBody"], hit["distance"])
```

**非 USD 資產（OBJ/STL/FBX）轉 USD**：使用 `omni.kit.asset_converter` 建立轉換任務（[完整片段](https://docs.isaacsim.omniverse.nvidia.com/latest/python_scripting/environment_setup.html#convert-asset-to-usd)）。

**儲存目前 stage 成 USD：**

```python
import omni
omni.usd.get_context().save_as_stage("C:/tmp/my_stage.usd", None)
```

**大量幾何渲染選擇**：`UsdGeom.Points`（需與渲染器互動時最有效率）、`UsdGeom.PointInstancer`（需與物理互動時）、`DebugDraw`（純視覺化、效能最佳）。

### 6.5 API 文件

- [Python API 總覽](https://docs.isaacsim.omniverse.nvidia.com/latest/reference_python_api.html)
- [Core API 教學系列](https://docs.isaacsim.omniverse.nvidia.com/latest/core_api_tutorials/index.html)：Hello World → Hello Robot → 加入機械手臂 → 多機器人 → 多任務場景 → 加入道具。

---

## 7. 機器人與感測器模擬

### 7.1 匯入與匯出

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/importer_exporter/importers_exporters.html)

| 工具 | 功能 |
|---|---|
| [URDF Importer](https://docs.isaacsim.omniverse.nvidia.com/latest/importer_exporter/ext_isaacsim_asset_importer_urdf.html) | 匯入 ROS 標準的 URDF 機器人描述 |
| [USD → URDF Exporter](https://docs.isaacsim.omniverse.nvidia.com/latest/importer_exporter/ext_omni_exporter_urdf.html) | 反向匯出 URDF |
| [MJCF Importer](https://docs.isaacsim.omniverse.nvidia.com/latest/importer_exporter/ext_isaacsim_asset_importer_mjcf.html) | 匯入 MuJoCo 格式 |
| [Onshape Importer](https://docs.omniverse.nvidia.com/extensions/latest/ext_onshape.html)／[CAD Converter](https://docs.omniverse.nvidia.com/extensions/latest/ext_cad-converter.html) | 匯入 CAD 模型 |

### 7.2 機器人設定（Robot Setup）

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/robot_setup/index.html)

工具：**Robot Inspector**（檢查）、**Robot Poser**（擺姿勢）、**Robot Assembler**（組裝）、**Gain Tuner**（增益調校）、**Joint / Physics Inspector**（關節與物理檢視）、**Self-Collision Detector**（自碰撞偵測）、**Asset Validation**（資產驗證）。

官方提供 13 篇 [Robot Setup 教學系列](https://docs.isaacsim.omniverse.nvidia.com/latest/robot_setup_tutorials/index.html)：從 stage 設定、組裝簡單機器人、articulation、加相機感測器、rig 移動機器人、設定機械手臂，到閉鏈結構、關節增益調校、資產最佳化、腿式機器人 rigging。

### 7.3 機器人模擬與關節控制

[Articulation Controller](https://docs.isaacsim.omniverse.nvidia.com/latest/robot_simulation/articulation_controller.html)｜[Robot Simulation Snippets](https://docs.isaacsim.omniverse.nvidia.com/latest/python_scripting/robots_simulation.html)

`Articulation` 類是關節機構控制核心（**需在模擬 Play 中操作**）：

```python
from isaacsim.core.experimental.prims import Articulation

articulation = Articulation("/Franka")

# 查詢
print(articulation.num_dofs, articulation.dof_names)          # 自由度數量與名稱
print(articulation.get_dof_positions())                        # 關節位置
print(articulation.get_dof_velocities(), articulation.get_dof_efforts())

# 位置控制（預設模式）
articulation.set_dof_position_targets([...])

# 單一關節（以名稱取得索引）
articulation.set_dof_position_targets(0.04,
    dof_indices=articulation.get_dof_indices("panda_finger_joint1"))

# 速度／力矩控制
articulation.switch_dof_control_mode("velocity")
articulation.set_dof_velocity_targets([...])
articulation.switch_dof_control_mode("effort")
articulation.set_dof_efforts([...])
```

以正規表達式一次包裝多台機器人做批次控制：`Articulation("/World/Franka_.*")`。

其他：[移動機器人控制器](https://docs.isaacsim.omniverse.nvidia.com/latest/robot_simulation/mobile_robot_controllers.html)、[Surface Gripper（吸附式夾爪）](https://docs.isaacsim.omniverse.nvidia.com/latest/robot_simulation/ext_isaacsim_robot_surface_gripper.html)、[Grasp Editor](https://docs.isaacsim.omniverse.nvidia.com/latest/robot_simulation/grasp_editor.html)、[RL 策略範例](https://docs.isaacsim.omniverse.nvidia.com/latest/robot_simulation/ext_isaacsim_robot_policy_example.html)；實驗性運動規劃（[cuMotion](https://docs.isaacsim.omniverse.nvidia.com/latest/cumotion/index.html)、[PINK IK](https://docs.isaacsim.omniverse.nvidia.com/latest/pink/index.html)）。

### 7.4 感測器

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/index.html)

| 類別 | 內容 |
|---|---|
| **相機感測器** | RGB 相機、[深度相機](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/isaacsim_sensors_camera_depth.html)、[結構光相機](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/isaacsim_sensors_camera_structured_light.html) |
| **RTX 感測器**（光追模擬） | [RTX Lidar](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/isaacsim_sensors_rtx_lidar.html)、[RTX Radar](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/isaacsim_sensors_rtx_radar.html)、[RTX 聲學感測器](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/isaacsim_sensors_rtx_acoustic.html)、[自訂感測器 Profile](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/isaacsim_sensors_rtx_custom.html) |
| **物理式感測器** | [IMU](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/isaacsim_sensors_physics_imu.html)、[接觸感測器](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/isaacsim_sensors_physics_contact.html)、[關節力／狀態感測器](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/isaacsim_sensors_physics_articulation_force.html)、[Effort 感測器](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/isaacsim_sensors_physics_effort.html)、[物理射線感測器](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/isaacsim_sensors_physics_raycast.html) |
| **PhysX SDK 感測器** | 泛用感測器、PhysX 光達、光束感測器、[近接感測器](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/isaacsim_sensors_physx_proximity.html) |

> 注意：Isaac Sim 6.0 對感測器 API 有大幅改動（舊 Camera／RTX／物理感測器 API → Experimental API），升級請看 [6.0 遷移指南](https://docs.isaacsim.omniverse.nvidia.com/latest/migration_guides/isaac_sim_6_0/index.html)。

### 7.5 物理引擎

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/physics/index.html)

- [物理模擬基礎](https://docs.isaacsim.omniverse.nvidia.com/latest/physics/simulation_fundamentals.html)：剛體、碰撞、關節、材質等概念。
- [Newton 物理後端](https://docs.isaacsim.omniverse.nvidia.com/latest/physics/newton_physics.html)：與 PhysX 並列的新一代 GPU 物理引擎，可切換。
- [Newton Actuators 教學](https://docs.isaacsim.omniverse.nvidia.com/latest/newton_actuators_tutorials/index.html)：以 Python／USD／OmniGraph 設定致動器。
- 除錯工具：Physics Inspector、Simulation Data Visualizer、Physics Debug Window。

### 7.6 資產庫

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/assets/usd_assets_overview.html)

官方雲端資產庫（程式內以 `get_assets_root_path()` 取得根路徑）提供：[機器人資產](https://docs.isaacsim.omniverse.nvidia.com/latest/assets/usd_assets_robots.html)（Franka、UR10、Nova Carter、各式人形／四足等）、[感測器資產](https://docs.isaacsim.omniverse.nvidia.com/latest/assets/usd_assets_sensors.html)（RealSense、各廠牌光達等）、[道具](https://docs.isaacsim.omniverse.nvidia.com/latest/assets/usd_assets_props.html)、[環境](https://docs.isaacsim.omniverse.nvidia.com/latest/assets/usd_assets_environments.html)（倉庫、辦公室、醫院等）。離線環境可用 [本地資產包](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/install_faq.html)。

---

## 8. 生態系與進階主題

### 8.1 ROS 2 整合

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/ros2_landing_page.html)

透過 ROS 2 Bridge 將模擬與 ROS 2 生態接軌，官方教學涵蓋 30+ 主題：

- **入門**：TurtleBot URDF 匯入與駕駛、Clock、相機影像發布、RTX 光達／雷達、TF 樹與里程計、發布頻率控制、QoS。
- **進階**：[Nav2 導航](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_navigation.html)、多機器人導航、[MoveIt 2](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_moveit.html)、自訂訊息與 OmniGraph 節點、[以 ROS 2 服務控制模擬](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_simulation_control.html)（載入世界、生成實體、步進）、[透過 ROS 2 執行 RL 策略](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_rl_controller.html)。
- 亦支援 [NVIDIA Isaac ROS](https://docs.isaacsim.omniverse.nvidia.com/latest/nvidia_isaac_ros/isaac_ros_tutorials.html)（GPU 加速的 ROS 套件）。

### 8.2 合成資料生成（SDG）

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/synthetic_data_generation/index.html)

- **[Replicator](https://docs.isaacsim.omniverse.nvidia.com/latest/replicator_tutorials/index.html)**：感知資料生成框架——場景／物件式資料集、隨機化（Domain Randomization）、資料增強、自訂 Writer 與隨機化節點、[Synthetic Data Recorder](https://docs.isaacsim.omniverse.nvidia.com/latest/replicator_tutorials/tutorial_replicator_recorder.html)（GUI 錄製）。
- **[動作與事件資料生成](https://docs.isaacsim.omniverse.nvidia.com/latest/action_and_event_data_generation/index.html)**：人物模擬（Replicator Agent）、行為樹生成、VLM 場景描述、事件觸發。
- 專門工作流：[抓取 SDG](https://docs.isaacsim.omniverse.nvidia.com/latest/synthetic_data_generation/tutorial_replicator_grasping_sdg.html)、[MobilityGen（移動資料）](https://docs.isaacsim.omniverse.nvidia.com/latest/synthetic_data_generation/tutorial_replicator_mobility_gen.html)、[遙操作 SDG](https://docs.isaacsim.omniverse.nvidia.com/latest/synthetic_data_generation/tutorial_replicator_teleop_sdg.html)、[Cosmos SDG](https://docs.isaacsim.omniverse.nvidia.com/latest/replicator_tutorials/tutorial_replicator_cosmos.html)。

### 8.3 Isaac Lab（強化學習）

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/isaac_lab_tutorials/index.html)

- 在 Isaac Sim 準備機器人資產 → Isaac Lab 平行環境訓練 → [策略部署回 Isaac Sim](https://docs.isaacsim.omniverse.nvidia.com/latest/isaac_lab_tutorials/tutorial_policy_deployment.html)。
- 關鍵教學：[Cloner（環境複製）](https://docs.isaacsim.omniverse.nvidia.com/latest/isaac_lab_tutorials/tutorial_cloner.html)、[Instanceable Assets（可實例化資產）](https://docs.isaacsim.omniverse.nvidia.com/latest/isaac_lab_tutorials/tutorial_instanceable_assets.html)。
- Isaac Lab 本身的文檔在 [isaac-sim.github.io/IsaacLab](https://isaac-sim.github.io/IsaacLab/)。

### 8.4 數位孿生（Digital Twin）

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/digital_twin/index.html)

倉儲物流場景工具：[Warehouse Creator](https://docs.isaacsim.omniverse.nvidia.com/latest/digital_twin/warehouse_logistics/ext_omni_warehouse_creator.html)、[輸送帶工具](https://docs.isaacsim.omniverse.nvidia.com/latest/digital_twin/warehouse_logistics/ext_isaacsim_asset_gen_conveyor.html)、[NVIDIA cuOpt 路徑最佳化](https://docs.isaacsim.omniverse.nvidia.com/latest/digital_twin/warehouse_logistics/logistics_tutorial_cuopt.html)、[占據地圖生成](https://docs.isaacsim.omniverse.nvidia.com/latest/digital_twin/ext_isaacsim_asset_generator_occupancy_map.html)、[RTSP 即時相機串流](https://docs.isaacsim.omniverse.nvidia.com/latest/digital_twin/rtsp_camera_streaming.html)、Isaac Cortex（決策網路）。

### 8.5 OmniGraph（視覺化編程）

[原文連結](https://docs.isaacsim.omniverse.nvidia.com/latest/omnigraph/index.html)

節點式視覺編程框架，是 GUI 端機器人控制器與 ROS bridge 的底層。可用 [Python 撰寫自訂節點](https://docs.isaacsim.omniverse.nvidia.com/latest/omnigraph/omnigraph_custom_python_nodes.html)、[C++ 節點](https://docs.isaacsim.omniverse.nvidia.com/latest/omnigraph/omnigraph_custom_cpp_nodes.html)，或[以 Python 腳本操作 OmniGraph](https://docs.isaacsim.omniverse.nvidia.com/latest/omnigraph/omnigraph_scripting.html)。

### 8.6 自訂擴充（Extension）開發

[Templates](https://docs.isaacsim.omniverse.nvidia.com/latest/utilities/templates_index.html)｜[Extension Template Generator](https://docs.isaacsim.omniverse.nvidia.com/latest/utilities/extension_template_generator.html)

Extension 是 Kit 應用的組成單元，Isaac Sim 的多數工具本身就是 Extension。可用模板產生器快速建立自己的擴充（含 UI），支援熱重載。另有 [Application Template](https://docs.isaacsim.omniverse.nvidia.com/latest/app_template/index.html) 用於打造自訂 Kit 應用。

---

## 9. 實用資源

| 資源 | 連結 |
|---|---|
| 常見問題 FAQ | https://docs.isaacsim.omniverse.nvidia.com/latest/overview/faq_index.html |
| 疑難排解 | https://docs.isaacsim.omniverse.nvidia.com/latest/overview/troubleshooting.html |
| 版本說明（Release Notes） | https://docs.isaacsim.omniverse.nvidia.com/latest/overview/release_notes.html |
| 遷移指南（4.5→6.0 等） | https://docs.isaacsim.omniverse.nvidia.com/latest/migration_guides/index.html |
| 詞彙表 Glossary | https://docs.isaacsim.omniverse.nvidia.com/latest/reference_material/reference_glossary.html |
| 慣例（座標、單位） | https://docs.isaacsim.omniverse.nvidia.com/latest/reference_material/reference_conventions.html |
| 效能優化手冊 | https://docs.isaacsim.omniverse.nvidia.com/latest/reference_material/sim_performance_optimization_handbook.html |
| 鍵盤快捷鍵 | https://docs.isaacsim.omniverse.nvidia.com/latest/gui/reference_keyboard_shortcuts.html |
| UI 介面參考 | https://docs.isaacsim.omniverse.nvidia.com/latest/gui/reference_user_interface.html |
| GitHub（開源原始碼） | https://github.com/isaac-sim |
| 開發者論壇 | https://forums.developer.nvidia.com/c/omniverse/simulation/69 |
| Discord 社群 | https://discord.gg/4ZsTFksGh8 |

---

## 10. 官方文檔章節對照表

| 官方章節 | 中文譯名 | 內容摘要 |
|---|---|---|
| What Is Isaac Sim? | 什麼是 Isaac Sim | 產品總覽、生態系定位 |
| Installation | 安裝 | Quick Install／工作站／容器／雲端／pip |
| Quick Tutorials | 快速教學 | 基礎使用、基礎機器人（GUI/Extension/Standalone 三版本） |
| Concepts | 核心概念 | 參考架構、工作流程、UI、快捷鍵、資產結構 |
| Isaac Lab / ROS 2 / SDG / Digital Twin | 基礎應用 | 四大應用方向的教學入口 |
| Development Tools | 開發工具 | VS Code、Jupyter、Script Editor、MCP |
| Python Scripting and Tutorials | Python 腳本與教學 | 概念、Core API、程式片段、Core API 教學系列 |
| GUI Reference | GUI 參考 | 選單、偏好設定、選取模式 |
| OmniGraph | 視覺化編程 | 節點圖、自訂節點 |
| Importers and Exporters | 匯入匯出 | URDF／MJCF／CAD |
| Robot Setup | 機器人設定 | 檢查器、組裝、13 篇教學 |
| Robot Simulation | 機器人模擬 | Articulation、控制器、夾爪 |
| Sensors | 感測器 | 相機、RTX、物理式、PhysX |
| Physics | 物理 | 基礎、Newton、除錯 |
| Utilities | 工具 | 瀏覽器、模板、除錯與效能分析 |
| API Documentation | API 文件 | Python API 參考 |
| Reference Information | 參考資訊 | 詞彙、慣例、效能、USD |

---

*本文檔由 Claude 整理，資訊以官方文檔為準；如發現與最新版不符，請以連結內原文為主。*
