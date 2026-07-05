# Isaac Sim Standalone Python 實戰教學

> 專為 **Standalone Python 工作流程**設計的教學，適用 **Isaac Sim 6.0.x**，程式碼採用 **Core Experimental API**。
> Standalone 的核心賣點：**你**決定物理與渲染何時步進、可完全無頭（headless）執行——大規模 RL 訓練、批次資料生成、CI 自動化都靠它。

**學習目標**：理解 `python.sh / python.bat` 與 `SimulationApp` 的運作方式，能寫出「啟動 → 佈景 → 顯式步進迴圈 → 收尾」的完整獨立應用，會用無頭模式與串流，並完成一個批次模擬的綜合練習。

**參考官方頁面**：[Python Environment](https://docs.isaacsim.omniverse.nvidia.com/latest/python_scripting/manual_standalone_python.html)｜[Workflows](https://docs.isaacsim.omniverse.nvidia.com/latest/introduction/workflows.html)｜[Hello World：轉換成 Standalone](https://docs.isaacsim.omniverse.nvidia.com/latest/core_api_tutorials/tutorial_core_hello_world.html)

---

## 第 1 課：python.sh／python.bat 是什麼

Standalone 腳本**不是**用你系統的 Python 跑，而是用 Isaac Sim 安裝根目錄提供的啟動器：

```bash
# Linux（安裝根目錄下）
./python.sh my_script.py
# Windows
python.bat my_script.py
```

啟動器做三件事（[原理詳解](https://docs.isaacsim.omniverse.nvidia.com/latest/python_scripting/manual_standalone_python.html#details-how-python-sh-works)）：

1. 設定 `EXP_PATH` 指向 `apps/` 資料夾，讓 runtime 找得到 `.kit` 體驗設定檔。
2. 執行 `setup_python_env.sh` 設定環境變數：`ISAAC_PATH`（主安裝路徑）、`PYTHONPATH`（各 Extension 的 Python 介面）、`LD_LIBRARY_PATH`（二進位符號）、`CARB_APP_PATH`（Kit 核心執行檔）。
3. 用 Omniverse **內附的 Python 直譯器**（`kit/python/bin/python3`）執行你的腳本。

> 若你是用 pip/conda 安裝（`pip install isaacsim`），直接用該虛擬環境的 `python` 執行即可，見 [Python 環境安裝](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/install_python.html)。

---

## 第 2 課：最小應用——SimulationApp 的鐵則

```python
from isaacsim import SimulationApp

# 啟動應用（這行之前不能 import 任何 Omniverse 模組！）
simulation_app = SimulationApp({"headless": True})

### 所有 omniverse / isaacsim 相關 import 都放在這之後 ###

simulation_app.update()   # 渲染一個 frame
simulation_app.close()    # 清理並關閉應用
```

**鐵則一：`SimulationApp` 必須最先建立。** 所有 API 都由 Extension／runtime 外掛系統提供，應用沒啟動前它們根本不存在——先 `import omni.xxx` 再建 SimulationApp 必定失敗。

**鐵則二：無頭模式下**設 `"headless": True`，且任何會開視窗的呼叫（如 matplotlib 顯示）都要拿掉。

生命週期三件套：**建立**（載入應用）→ **`update()`**（步進一次 app：物理＋渲染）→ **`close()`**（收尾退出）。

---

## 第 3 課：跑官方入門範例

安裝根目錄的 `standalone_examples/` 是寶庫。先跑入門兩支：

```bash
# Linux
./python.sh standalone_examples/tutorials/getting_started/getting_started.py
./python.sh standalone_examples/tutorials/getting_started/getting_started_robot.py
# Windows
python.bat standalone_examples\tutorials\getting_started\getting_started.py
python.bat standalone_examples\tutorials\getting_started\getting_started_robot.py
```

第一支建立地板、光源、方塊並模擬；第二支加入 Franka 手臂與 Nova Carter 車，示範關節控制。其他實用範例（[完整清單](https://docs.isaacsim.omniverse.nvidia.com/latest/introduction/standalone_examples_list.html)）：

| 範例 | 指令（Linux；Windows 用 python.bat） |
|---|---|
| 載入 USD 場景並模擬 | `./python.sh standalone_examples/api/isaacsim.simulation_app/load_stage.py --usd_path /Isaac/Environments/Simple_Room/simple_room.usd` |
| URDF 匯入＋物理設定＋模擬 | `./python.sh standalone_examples/api/isaacsim.asset.importer.urdf/urdf_import.py` |
| 執行時改視窗解析度 | `./python.sh standalone_examples/api/isaacsim.simulation_app/change_resolution.py` |
| 批次轉換 OBJ/STL/FBX → USD | `./python.sh standalone_examples/api/omni.kit.asset_converter/asset_usd_converter.py --folders <資料夾...>` |
| 無頭＋WebRTC 串流 | `./python.sh standalone_examples/api/isaacsim.simulation_app/livestream.py` |

---

## 第 4 課：完整範本——佈景與顯式步進迴圈

把 Extension 版 Hello World 轉成 standalone（官方 [轉換教學](https://docs.isaacsim.omniverse.nvidia.com/latest/core_api_tutorials/tutorial_core_hello_world.html#converting-the-example-to-a-standalone-application)）。存成 `my_application.py`：

```python
# 任何 standalone 應用的固定開頭兩行
from isaacsim import SimulationApp

simulation_app = SimulationApp({"headless": False})  # 也可無頭執行

# 應用啟動後才 import 其他模組
import isaacsim.core.experimental.utils.stage as stage_utils
import numpy as np
import omni.timeline
from isaacsim.core.experimental.materials import PreviewSurfaceMaterial
from isaacsim.core.experimental.objects import Cube
from isaacsim.core.experimental.prims import GeomPrim, RigidPrim
from isaacsim.core.simulation_manager import SimulationManager
from isaacsim.storage.native import get_assets_root_path

# 佈景：地板 + 藍色剛體方塊
stage_utils.add_reference_to_stage(
    usd_path=get_assets_root_path() + "/Isaac/Environments/Grid/default_environment.usd",
    path="/World/ground",
)
visual_material = PreviewSurfaceMaterial("/World/Materials/blue")
visual_material.set_input_values("diffuseColor", [0.0, 0.0, 1.0])
cube_shape = Cube(
    paths="/World/fancy_cube",
    positions=np.array([[0.0, 0.0, 1.0]]),
    sizes=[1.0],
    scales=np.array([[0.5, 0.5, 0.5]]),
    reset_xform_op_properties=True,
)
GeomPrim(paths=cube_shape.paths, apply_collision_apis=True)
cube = RigidPrim(paths=cube_shape.paths)
cube_shape.apply_visual_materials(visual_material)

# 啟動時間軸（物理開始）
omni.timeline.get_timeline_interface().play()
simulation_app.update()

# 模擬主迴圈：一切步進由你掌控
for i in range(50):
    if SimulationManager.is_simulating():
        positions, orientations = cube.get_world_poses()
        linear_velocities, angular_velocities = cube.get_velocities()
        print("Cube position is : " + str(positions.numpy()[0]))
        print("Cube's linear velocity is : " + str(linear_velocities.numpy()[0]))

    simulation_app.update()   # 步進一次（物理 + 渲染）

simulation_app.close()
```

**與 Extension 的根本差異**：這裡的查詢／控制程式碼**就放在迴圈裡**，每步自然執行——不需要註冊回呼。「先完成一組命令、再步進」有了保證，這正是訓練與資料生成需要的性質。

---

## 第 5 課：更細的步進控制——SimulationManager 與 RenderingManager

`simulation_app.update()` 是「物理＋渲染」打包步進。需要分開控制時：

```python
from isaacsim.core.rendering_manager import RenderingManager
from isaacsim.core.simulation_manager import SimulationManager

arm.set_dof_positions([-1.5, 0.0, 0.0, -1.5, 0.0, 1.5, 0.5, 0.04, 0.04])

for _ in range(100):
    SimulationManager.step()      # 只步進物理
    RenderingManager.render()     # 只渲染
    simulation_app.update()
    print("Joint positions:", arm.get_dof_positions())
```

應用場景：

- **訓練**：每個 action 後步進物理 N 次、渲染 1 次（省渲染成本）。
- **感測器資料**：控制「模擬狀態 ↔ 渲染影像」的對應關係。
- **ROS**：精準控制訊息發布頻率。

---

## 第 6 課：無頭模式、串流與額外 Extension

**無頭執行**（伺服器／CI 標配）：

```python
simulation_app = SimulationApp({"headless": True})
```

想遠端看畫面：跑 [livestream 範例](https://docs.isaacsim.omniverse.nvidia.com/latest/python_scripting/manual_standalone_python.html#livestream)並用 [WebRTC 串流用戶端](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/manual_livestream_clients.html)連線。

**啟用額外 Extension**（standalone 預設只載入基本組）：

```python
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from isaacsim.core.utils.extensions import enable_extension
enable_extension("omni.kit.widget.stage")   # 例：啟用 Stage 面板
enable_extension("omni.kit.widget.layers")
simulation_app.update()
```

也可以在體驗檔（如 `apps/isaacsim.exp.base.python.kit`）的 `[dependencies]` 區段宣告。

**零延遲渲染**：預設渲染管線允許最多 3 個 frame 在途（換取 FPS）；需要「渲染影像 = 最新模擬狀態」時，改用零延遲體驗檔：

```python
import os
from isaacsim import SimulationApp

SimulationApp({"headless": True}, experience=f"{os.environ['EXP_PATH']}/isaacsim.exp.base.zero_delay.kit")
```

或用 `extra_args` 逐項設定（`--/app/hydraEngine/waitIdle=1` 等，見 [Util Snippets](https://docs.isaacsim.omniverse.nvidia.com/latest/python_scripting/util_snippets.html#rendering-frame-delay)）。

---

## 第 7 課：綜合練習——無頭批次實驗

把所學組成一個典型的「批次模擬」腳本：無頭跑 3 回合方塊自由落體，每回合不同起始高度，記錄落地位置後輸出 CSV。

```python
from isaacsim import SimulationApp

simulation_app = SimulationApp({"headless": True})

import csv
import isaacsim.core.experimental.utils.stage as stage_utils
import numpy as np
import omni.timeline
from isaacsim.core.experimental.objects import Cube, GroundPlane
from isaacsim.core.experimental.prims import GeomPrim, RigidPrim
from isaacsim.core.simulation_manager import SimulationManager

results = []
timeline = omni.timeline.get_timeline_interface()

for episode, drop_height in enumerate([0.5, 1.0, 2.0]):
    # 每回合重建乾淨場景
    stage_utils.create_new_stage()
    stage_utils.define_prim("/World/physicsScene", "PhysicsScene")
    GroundPlane("/World/GroundPlane", positions=[0, 0, 0])
    cube_shape = Cube("/World/box", positions=[0.1, 0.0, drop_height], sizes=0.2)
    GeomPrim(cube_shape.paths, apply_collision_apis=True)
    cube = RigidPrim(cube_shape.paths, masses=[1.0])

    timeline.play()
    simulation_app.update()

    for _ in range(240):                # 模擬約 4 秒
        simulation_app.update()

    if SimulationManager.is_simulating():
        pos = cube.get_world_poses()[0].numpy()[0]
        results.append({"episode": episode, "drop_height": drop_height,
                        "x": pos[0], "y": pos[1], "z": pos[2]})
        print(f"回合 {episode}：從 {drop_height} m 落下，最終位置 {pos}")

    timeline.stop()

with open("drop_results.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["episode", "drop_height", "x", "y", "z"])
    writer.writeheader()
    writer.writerows(results)

simulation_app.close()
print("結果已寫入 drop_results.csv")
```

**驗收**：終端機印出三回合的最終位置（z 應接近 0.1，即方塊半高），工作目錄出現 `drop_results.csv`。

**延伸挑戰**：

1. 每回合隨機化方塊初始 XY 與質量（domain randomization 的雛形）。
2. 換成 Franka：每回合送一組隨機關節目標，記錄 100 步後的實際關節位置。
3. 加上 `argparse` 讓回合數、高度清單可由命令列指定——正式實驗腳本的樣子。

---

## 常見錯誤與除錯指南

| 症狀 | 原因與解法 |
|---|---|
| 一開始就 `ModuleNotFoundError`／crash | 在 `SimulationApp` 建立**之前** import 了 Omniverse 模組。把所有相關 import 移到其後 |
| 用系統 Python 跑失敗 | 要用安裝根目錄的 `./python.sh`／`python.bat`（或 pip 安裝的專屬虛擬環境） |
| 無頭模式下卡住／崩潰 | 有開視窗的呼叫（matplotlib 等）。全部移除或改存檔 |
| 查詢回傳無效資料 | 時間軸沒播放。`timeline.play()` 後至少 `update()` 一次；查詢前用 `SimulationManager.is_simulating()` 防呆 |
| 腳本結束但行程沒退出 | 少了 `simulation_app.close()` |
| 首次啟動特別慢 | 著色器快取暖機屬正常現象；無頭伺服器同樣適用 |
| 需要某個 GUI 工具的功能 | standalone 預設不載入所有 Extension，用 `enable_extension()` 啟用 |
| 渲染影像落後模擬狀態 | 預設 3 frame 在途。用 zero-delay 體驗檔（第 6 課） |

---

## 附錄：SimulationApp 常用設定

```python
SimulationApp({
    "headless": True,          # 無頭模式
    "width": 1280,             # 視窗／渲染解析度
    "height": 720,
    "extra_args": [            # 進階：直接傳 Kit 設定
        "--/app/hydraEngine/waitIdle=1",
    ],
}, experience="<path>/isaacsim.exp.base.zero_delay.kit")  # 指定體驗檔
```

完整參數見 [SimulationApp API 文件](https://docs.isaacsim.omniverse.nvidia.com/latest/py/source/extensions/isaacsim.simulation_app/docs/index.html)。

**下一步**：對照另外兩條路線——《[Script Editor 實戰教學](./Script-Editor-教學.md)》（互動探索）與《[Extension 教學](./Extension-教學.md)》（UI 工具開發）；或直接進入 [Isaac Lab](https://docs.isaacsim.omniverse.nvidia.com/latest/isaac_lab_tutorials/index.html) 用平行環境做強化學習。

---

*本教學由 Claude 依據 Isaac Sim 6.0.1 官方文檔設計；官方程式片段經整理改編，請以官方文檔為準。*
