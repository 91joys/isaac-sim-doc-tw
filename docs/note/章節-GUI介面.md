# GUI 與介面參考（GUI Reference）

> 對應官方 [GUI Reference](https://docs.isaacsim.omniverse.nvidia.com/latest/gui/index.html) 章節的中文導覽。GUI 是三種工作流程之一（見《完整文檔》5.1 節），本頁整理介面組成、常用選單與快捷鍵。

---

## 工作區組成

Isaac Sim 預設工作區的主要面板（詳見 [User Interface Reference](https://docs.isaacsim.omniverse.nvidia.com/latest/gui/reference_user_interface.html)）：

| 面板 | 位置 | 用途 |
|---|---|---|
| **Viewport** | 中央 | 3D 場景視圖；左上有渲染模式、顯示選項（「眼睛」圖示）等控制 |
| **左側工具列** | 左緣 | Play／Stop、選取／移動／旋轉／縮放工具 |
| **Stage** | 右上 | USD prim 樹——場景中一切物件的階層 |
| **Property** | 右下 | 選取 prim 的屬性檢視與編輯（Transform、物理、材質…） |
| **Content Browser** | 下方 | 檔案與資產瀏覽 |
| **Console** | 下方 | 日誌與錯誤訊息 |

常用視窗都從 **Window** 選單開啟：Script Editor、Extensions、Examples、Graph Editors 等。

## 常用選單

### Create 選單

[官方參考](https://docs.isaacsim.omniverse.nvidia.com/latest/gui/menu_create.html)。快速建立物件的入口：

- **Create > Physics**：Ground Plane、Physics Scene 等。
- **Create > Shape**：Cube、Sphere、Cylinder 等基本幾何。
- **Create > Lights**：Distant／Dome／Sphere Light 等光源。
- **Create > Robots**：官方機器人資產（Franka、UR10、Carter…）。
- **Create > Environment**：現成環境（Simple Room 等）。

### 其他選單

- [Replicator 選單](https://docs.isaacsim.omniverse.nvidia.com/latest/gui/menu_replicator.html)——合成資料錄製與 Replicator 工具。
- **Tools > Physics**：Physics Inspector 等物理工具。
- **Tools > Robotics**：OmniGraph 控制器產生器、資產工具。
- [Preferences（偏好設定）](https://docs.isaacsim.omniverse.nvidia.com/latest/gui/preferences.html)——快取路徑、渲染、資產根路徑等設定。

## 快捷鍵與操作

完整清單見 [Keyboard Shortcuts Reference](https://docs.isaacsim.omniverse.nvidia.com/latest/gui/reference_keyboard_shortcuts.html)。最常用的：

| 按鍵 | 功能 |
|---|---|
| **W / E / R** | 移動／旋轉／縮放 Gizmo |
| **Esc** | 取消選取 |
| **F** | 鏡頭聚焦到選取物件 |
| **滑鼠右鍵拖曳** | 環繞視角 |
| **滑鼠中鍵拖曳** | 平移視角 |
| **滾輪** | 縮放視角 |
| **Ctrl+Z / Ctrl+Y** | 復原／重做 |
| **Ctrl+S** | 存檔（在 VS Code 編輯 Extension 時觸發熱重載） |

選取行為的細節（階層選取、選取模式切換）見 [Selection Modes](https://docs.isaacsim.omniverse.nvidia.com/latest/gui/selection-modes.html)。

## GUI 與程式碼的對照學習法

1. 打開 **Commands Tool**（[說明](https://docs.isaacsim.omniverse.nvidia.com/latest/utilities/debugging/ext_omni_kit_commands.html)）：每個 GUI 操作對應的 Python 命令都會列出來，可直接複製到 Script Editor。
2. GUI 建好的場景 **File > Save** 成 USD 後，可在 Standalone 腳本以 `add_reference_to_stage()` 或 `open_stage` 載回程式化操作。
3. 反向亦然：程式建立的 prim 立即出現在 Stage 面板，屬性可在 Property 面板核對。

## 本章官方頁面總表

| 頁面 | 連結 |
|---|---|
| GUI 總覽 | https://docs.isaacsim.omniverse.nvidia.com/latest/gui/index.html |
| 介面參考 | https://docs.isaacsim.omniverse.nvidia.com/latest/gui/reference_user_interface.html |
| 快捷鍵參考 | https://docs.isaacsim.omniverse.nvidia.com/latest/gui/reference_keyboard_shortcuts.html |
| Create 選單 | https://docs.isaacsim.omniverse.nvidia.com/latest/gui/menu_create.html |
| Replicator 選單 | https://docs.isaacsim.omniverse.nvidia.com/latest/gui/menu_replicator.html |
| 偏好設定 | https://docs.isaacsim.omniverse.nvidia.com/latest/gui/preferences.html |
| 選取模式 | https://docs.isaacsim.omniverse.nvidia.com/latest/gui/selection-modes.html |

---

*本頁為官方文檔中文導覽，內容以官方為準。*
