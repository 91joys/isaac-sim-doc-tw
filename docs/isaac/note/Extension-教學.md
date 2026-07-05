# Isaac Sim Extension 工作流程實戰教學

> 專為 **Extension 工作流程**設計的教學，適用 **Isaac Sim 6.0.x**，程式碼採用 **Core Experimental API**。
> 建議先完成《[Script Editor 實戰教學](./Script-Editor-教學.md)》——Script Editor 本身就是最簡單的 Extension 互動形式，本篇把它升級成「有 UI、可重複載入、隨模擬事件運作」的正式應用模組。

**學習目標**：理解 Extension 的結構與生命週期，能修改內建範例（BaseSample）、運用熱重載快速迭代、註冊模擬事件回呼，並用官方模板建立自己的 UI 擴充。

**參考官方頁面**：[Workflows](https://docs.isaacsim.omniverse.nvidia.com/latest/introduction/workflows.html)｜[Hello World 教學](https://docs.isaacsim.omniverse.nvidia.com/latest/core_api_tutorials/tutorial_core_hello_world.html)｜[Templates](https://docs.isaacsim.omniverse.nvidia.com/latest/utilities/templates_index.html)

---

## 第 1 課：Extension 是什麼

Extension 是 Omniverse Kit 應用的**基本組成單元**——Isaac Sim 裡你看到的多數工具（Stage 面板、Physics Inspector、URDF Importer…）本身都是 Extension。它的特性：

- **非同步執行**：與渲染、物理並行，UI 保持互動。
- **熱重載（Hot Reload）**：改完程式存檔，變更立即生效，不用重啟 Isaac Sim。
- **可組合**：依專案需求啟用／停用任意一組 Extension（**Window > Extensions** 管理）。

一個最小的 Extension 資料夾長這樣：

```
my_extension/
├── config/
│   └── extension.toml     ← 名稱、版本、相依性等中繼資料
└── scripts/（或套件目錄）
    ├── __init__.py
    └── extension.py       ← 進入點：on_startup() / on_shutdown()
```

**適用情境**：測試 Python 片段、打造互動式 GUI 工具、自訂應用模組、對即時性敏感的應用。若你要的是大規模訓練或無頭批次模擬，請看《[Standalone Python 教學](./Standalone-Python-教學.md)》。

---

## 第 2 課：從內建範例開始——Hello World

官方每個互動範例都是 Extension，是最好的學習起點。

1. 開啟 **Window > Examples > Robotics Examples**。
2. 點 **Robotics Examples > General > Hello World**，工作區會出現範例視窗。
3. 點 **Open Source Code** 用 VS Code 打開原始碼；點 **Open Containing Folder** 打開檔案所在資料夾。

資料夾裡有三個檔案：

| 檔案 | 角色 |
|---|---|
| `hello_world.py` | **應用邏輯**（本教學主要修改對象） |
| `hello_world_extension.py` | UI 元素與邏輯的連結 |
| `__init__.py` | 套件初始化 |

4. **File > New From Stage Template > Empty** 建新 stage。
5. 按範例視窗的 **LOAD** 按鈕載入 World。

### BaseSample：範例的共同骨架

`HelloWorld` 繼承自 `BaseSample`——一個幫你把樣板事務都做好的基底類：用按鈕載入資產、開新 stage 時清空、把物件重設回預設狀態、處理熱重載。

```python
import isaacsim.core.experimental.utils.stage as stage_utils
from isaacsim.examples.base.base_sample_experimental import BaseSample
from isaacsim.storage.native import get_assets_root_path

class HelloWorld(BaseSample):
    def __init__(self) -> None:
        super().__init__()

    # 按下 LOAD 時被呼叫：在這裡佈置場景
    def setup_scene(self):
        stage_utils.add_reference_to_stage(
            usd_path=get_assets_root_path() + "/Isaac/Environments/Grid/default_environment.usd",
            path="/World/ground",
        )
```

---

## 第 3 課：熱重載——Extension 的殺手級功能

1. 在 VS Code 打開 `hello_world.py`，隨意加一行 `print("reloaded!")`。
2. 按 **Ctrl+S** 存檔——注意 Isaac Sim 裡範例選單瞬間消失又重建（模組被重啟了）。
3. 重新打開範例選單、按 **LOAD**，改動已生效。

**每次改完程式 → Ctrl+S → 重開選單 → LOAD**，這就是 Extension 開發的迭代循環，全程不需重啟模擬器。

---

## 第 4 課：在場景中加入剛體方塊

修改 `setup_scene()`，用「幾何 → 疊碰撞 → 疊剛體」的分層模式加一顆藍色方塊：

```python
import isaacsim.core.experimental.utils.stage as stage_utils
import numpy as np
from isaacsim.core.experimental.materials import PreviewSurfaceMaterial
from isaacsim.core.experimental.objects import Cube
from isaacsim.core.experimental.prims import GeomPrim, RigidPrim
from isaacsim.examples.base.base_sample_experimental import BaseSample
from isaacsim.storage.native import get_assets_root_path

class HelloWorld(BaseSample):
    def __init__(self) -> None:
        super().__init__()

    def setup_scene(self):
        stage_utils.add_reference_to_stage(
            usd_path=get_assets_root_path() + "/Isaac/Environments/Grid/default_environment.usd",
            path="/World/ground",
        )

        visual_material = PreviewSurfaceMaterial("/World/Materials/blue")
        visual_material.set_input_values("diffuseColor", [0.0, 0.0, 1.0])

        self._cube_shape = Cube(
            paths="/World/fancy_cube",
            positions=np.array([[0.0, 0.0, 1.0]]),   # 離地 1 公尺
            sizes=[1.0],
            scales=np.array([[0.5015, 0.5015, 0.5015]]),
            reset_xform_op_properties=True,
        )
        GeomPrim(paths=self._cube_shape.paths, apply_collision_apis=True)   # 碰撞
        self._cube = RigidPrim(paths=self._cube_shape.paths)                # 剛體
        self._cube_shape.apply_visual_materials(visual_material)
```

Ctrl+S → 重開選單 → **LOAD**：模擬自動開始，方塊落下。

**分層回顧**：`Cube` 建立視覺幾何 → `GeomPrim` 加碰撞（可單獨用來做靜態障礙物）→ `RigidPrim` 加剛體動力學。要「會擋但不會掉」就只疊 GeomPrim；要完整動力學就兩個都疊。

---

## 第 5 課：查詢物體狀態——setup_post_load 與 warp 陣列

`BaseSample` 提供 `setup_post_load()`：在 LOAD 完成、**物理已步進一步之後**呼叫——這時物理 handle 才有效，可以安全查詢：

```python
    async def setup_post_load(self):
        positions, orientations = self._cube.get_world_poses()
        linear_velocities, angular_velocities = self._cube.get_velocities()

        print("Cube position is : " + str(positions.numpy()[0]))
        print("Cube's orientation is : " + str(orientations.numpy()[0]))
        print("Cube's linear velocity is : " + str(linear_velocities.numpy()[0]))
```

**重要**：Experimental API 回傳的是**批次化的 warp 陣列**（即使只有一個物件）。用 `.numpy()` 轉成 numpy，再用 `[0]` 取第一個元素。

---

## 第 6 課：模擬事件回呼——完整的 Extension 類

要在**每個物理步**做事（連續列印、連續控制），用 `SimulationManager` 註冊回呼，並在收尾時取消註冊。完整範例：

```python
import isaacsim.core.experimental.utils.stage as stage_utils
import numpy as np
from isaacsim.core.experimental.materials import PreviewSurfaceMaterial
from isaacsim.core.experimental.objects import Cube
from isaacsim.core.experimental.prims import GeomPrim, RigidPrim
from isaacsim.core.simulation_manager import SimulationManager
from isaacsim.examples.base.base_sample_experimental import BaseSample
from isaacsim.storage.native import get_assets_root_path

class HelloWorld(BaseSample):
    def __init__(self) -> None:
        super().__init__()
        self._physics_callback_id = None

    def setup_scene(self):
        stage_utils.add_reference_to_stage(
            usd_path=get_assets_root_path() + "/Isaac/Environments/Grid/default_environment.usd",
            path="/World/ground",
        )
        visual_material = PreviewSurfaceMaterial("/World/Materials/blue")
        visual_material.set_input_values("diffuseColor", [0.0, 0.0, 1.0])
        self._cube_shape = Cube(
            paths="/World/fancy_cube",
            positions=np.array([[0.0, 0.0, 1.0]]),
            sizes=[1.0],
            scales=np.array([[0.5015, 0.5015, 0.5015]]),
            reset_xform_op_properties=True,
        )
        GeomPrim(paths=self._cube_shape.paths, apply_collision_apis=True)
        self._cube = RigidPrim(paths=self._cube_shape.paths)
        self._cube_shape.apply_visual_materials(visual_material)

    async def setup_post_load(self):
        from isaacsim.core.simulation_manager.impl.isaac_events import IsaacEvents

        self._physics_callback_id = SimulationManager.register_callback(
            self.print_cube_info, IsaacEvents.POST_PHYSICS_STEP
        )

    # 每個物理步之後被呼叫，簽名固定為 (dt, context)
    def print_cube_info(self, dt, context):
        positions, orientations = self._cube.get_world_poses()
        linear_velocities, angular_velocities = self._cube.get_velocities()
        print("Cube position is : " + str(positions.numpy()[0]))
        print("Cube's linear velocity is : " + str(linear_velocities.numpy()[0]))

    # Extension 卸載時清理資源——沒做這步，熱重載後會殘留幽靈回呼
    def physics_cleanup(self):
        if self._physics_callback_id is not None:
            SimulationManager.deregister_callback(self._physics_callback_id)
            self._physics_callback_id = None
```

**生命週期總覽**：`setup_scene()`（LOAD 時佈景）→ `setup_post_load()`（物理就緒後初始化／註冊回呼）→ 回呼隨物理步執行 → `physics_cleanup()`（卸載時清理）。

---

## 第 7 課：建立自己的 Extension——官方模板

> **6.0 重要變更**：UI 版模板產生器（Utilities > Generate Extension Templates，`isaacsim.examples.extension`）已**棄用**，官方建議改用 [CLI Extension Templates](https://docs.isaacsim.omniverse.nvidia.com/latest/utilities/cli_extension_templates.html) 從命令列產生模板；VS Code 使用者另有 [進階模板產生器](https://docs.isaacsim.omniverse.nvidia.com/latest/utilities/vscode_extension_template_generator.html)。模板的**內部結構與概念不變**，以下說明兩者皆適用。

每個模板都有共同結構（見 [Extension Template Generator Explained](https://docs.isaacsim.omniverse.nvidia.com/latest/utilities/extension_templates_tutorial.html)）：

| 檔案 | 角色 |
|---|---|
| `global_variables.py` | 儲存建立模板時輸入的標題、描述等全域變數 |
| `extension.py` | 讓擴充出現在工具列的標準樣板，**通常不需修改** |
| `ui_builder.py` | **你的主要進入點**：UI 元素與回呼函式都寫在這裡 |

`ui_builder.py` 提供的標準回呼：

- `on_menu_callback()`——擴充被開啟時
- `on_timeline_event()`——時間軸停止／暫停／播放時
- `on_physics_step()`——每個物理步（僅在播放中發生）
- `on_stage_event()`——stage 開啟或關閉時
- `cleanup()`——擴充關閉、需要清理物理訂閱等資源時
- `build_ui()`——建立你要的 UI

UI 用一組 `UIElementWrapper` 包裝類（`FloatField`、`Button`、`DropDown`、`StateButton`…）快速組裝：例如建立一個 `FloatField`，使用者改值時你的回呼就會收到新的 float。完整元件清單見 [UI 元件 API 文件](https://docs.isaacsim.omniverse.nvidia.com/latest/py/source/extensions/isaacsim.gui.components/docs/index.html)。

---

## 第 8 課：Loaded Scenario 模式——Load／Reset／Run

**Loaded Scenario Template** 給你三顆按鈕的標準 UI，把「時間軸與初始化」這些容易踩雷的事管起來：

| 按鈕 | 回呼 | 你可以假設什麼 |
|---|---|---|
| **Load** | `setup_scene_fn()` → 把資產載入 stage | 剛建立新的 World |
| | `setup_post_load_fn()` | 資產已載入、物件已初始化、時間軸暫停在第 0 步 |
| **Reset** | `pre_reset_fn()` | 無保證（重設前） |
| | `post_reset_fn()` | 物件已初始化並**回到建立時的預設位置**、時間軸暫停在第 0 步 |
| **Run** | `StateButton` 的 `physics_callback_fn()` | 在 B 狀態（Run 中）每個物理步被呼叫；切回 A 狀態自動取消訂閱 |

核心概念：**物理只在時間軸播放時運作**，`Articulation` 只有在播放中才能存取——因此需要在「停止→播放」的轉換點做初始化。這個模板把這些都處理好了，時間軸操作交給 Load／Reset 按鈕即可（如果使用者亂按左側工具列的 Play/Stop，模板也會自動重設 UI 維持假設成立）。

---

## 第 9 課：Scripting 模式——用 yield 寫「長時間任務」

**Scripting Template** 示範怎麼在非同步的 Extension 世界裡寫「腳本式」的連續行為（例如夾取－放置）：用 Python 的 **generator（yield）**。

原理：把長任務寫成含 `yield` 的函式，每個物理步呼叫一次 `next(generator)`，程式就會執行到下一個 `yield` 停住——「每步檢查一次、沒完成就讓出控制權」。官方範例（開啟 Franka 夾爪）：

```python
def open_gripper_franka(self, articulation):
    open_gripper_action = ArticulationAction(np.array([0.04, 0.04]), joint_indices=np.array([7, 8]))
    articulation.apply_action(open_gripper_action)

    # 每個 frame 檢查一次，直到夾爪確實張開
    while not np.allclose(articulation.get_joint_positions()[7:], np.array([0.04, 0.04]), atol=0.001):
        yield ()

    return True
```

主腳本 `my_script()` 以 `yield from goto_position(...)`、`yield from open_gripper_franka(...)`、`yield from close_gripper_franka(...)` 串成一連串動作；模板在每個物理步呼叫 `next(self._script_generator)` 推進。這是在 Extension 中實作**順序性任務**（等待到位→下一步）最乾淨的模式。

另有 **Configuration Tooling Template**（做資產設定工具：DropDown 自動列出 stage 上所有 Articulation、動態產生每個關節的控制 UI）與 **UI Component Library**（所有 UI 包裝元件的展示與回呼簽名參考）。

---

## 常見問題與最佳實務

| 症狀／問題 | 說明 |
|---|---|
| 熱重載後行為怪異、輸出重複 | 前一版的回呼沒清理。務必在 `physics_cleanup()`／`cleanup()` 取消註冊所有回呼與訂閱 |
| `Articulation` 拿不到資料 | 時間軸沒在播放。初始化放在 `setup_post_load` 或「停止→播放」事件之後 |
| 修改沒生效 | 存檔了嗎？Ctrl+S 觸發熱重載後，要**重新開啟**範例選單再 LOAD |
| 想找 UI 寫法 | 先看 UI Component Library 模板，再查 `UIElementWrapper` API 文件 |
| 該用 Extension 還是 Standalone？ | 要 UI、要互動、要熱重載 → Extension；要精準步進、無頭執行、大規模訓練 → [Standalone](./Standalone-Python-教學.md) |
| 舊版（4.x）教學的 `omni.isaac.examples` 找不到 | 4.5 起擴充功能全面改名。對照[遷移指南](https://docs.isaacsim.omniverse.nvidia.com/latest/migration_guides/index.html) |

---

## 下一步

- 官方 [Core API 教學系列](https://docs.isaacsim.omniverse.nvidia.com/latest/core_api_tutorials/index.html)後續章節（Hello Robot、加入機械手臂、多機器人）主要就是以 Extension 工作流程開發。
- 想把 Extension 打包成獨立應用：[Application Template](https://docs.isaacsim.omniverse.nvidia.com/latest/app_template/index.html)。
- 對照另一條路線：《[Standalone Python 教學](./Standalone-Python-教學.md)》。

---

*本教學由 Claude 依據 Isaac Sim 6.0.1 官方文檔設計；官方程式片段經整理改編，請以官方文檔為準。*
