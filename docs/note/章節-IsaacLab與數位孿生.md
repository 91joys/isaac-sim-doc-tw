# Isaac Lab 與數位孿生（Isaac Lab & Digital Twin）

> 對應官方 [Isaac Lab](https://docs.isaacsim.omniverse.nvidia.com/latest/isaac_lab_tutorials/index.html) 與 [Digital Twin](https://docs.isaacsim.omniverse.nvidia.com/latest/digital_twin/index.html) 章節的中文導覽——兩條「模擬之後」的路線：把機器人送去**學習**，或把場域搬進**數位孿生**。

---

## Isaac Lab（強化學習／模仿學習）

**Isaac Lab** 是建立在 Isaac Sim 之上的機器人學習框架，以 GPU 平行環境訓練 RL／IL 策略。分工：Isaac Sim 負責準備資產與場景、驗證與部署；Isaac Lab 負責訓練（其自身文檔在 [isaac-sim.github.io/IsaacLab](https://isaac-sim.github.io/IsaacLab/)）。

Isaac Sim 文檔內與 Isaac Lab 相關的關鍵教學：

| 主題 | 說明 | 連結 |
|---|---|---|
| 策略部署回 Isaac Sim | 把 Isaac Lab 訓練好的策略放回 Isaac Sim 執行驗證 | [教學](https://docs.isaacsim.omniverse.nvidia.com/latest/isaac_lab_tutorials/tutorial_policy_deployment.html) |
| 透過 ROS 2 執行 RL 策略 | Isaac Sim 發布觀測、接收動作的 SIL 評估 | [教學](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_rl_controller.html) |
| Cloner（環境複製） | 大規模平行環境的基礎：把一個環境複製 N 份 | [教學](https://docs.isaacsim.omniverse.nvidia.com/latest/isaac_lab_tutorials/tutorial_cloner.html) |
| Instanceable Assets | 可實例化資產：平行環境的記憶體優化關鍵 | [教學](https://docs.isaacsim.omniverse.nvidia.com/latest/isaac_lab_tutorials/tutorial_instanceable_assets.html) |
| 腿式機器人 rigging | 為 locomotion policy 準備機器人資產 | [教學](https://docs.isaacsim.omniverse.nvidia.com/latest/robot_setup_tutorials/tutorial_rig_legged_robot.html) |
| Isaac Lab 疑難排解 | 安裝與訓練常見問題 | [說明](https://docs.isaacsim.omniverse.nvidia.com/latest/isaac_lab_tutorials/troubleshooting.html) |

典型閉環：**Isaac Sim rig 機器人 → Isaac Lab 平行訓練 → （Lab-Arena 大規模評測）→ 策略部署回 Isaac Sim → ROS 2 SIL 驗證 → 上實機**。

## 數位孿生（Digital Twin）

[章節總覽](https://docs.isaacsim.omniverse.nvidia.com/latest/digital_twin/index.html)——以倉儲物流為主要場景的數位孿生工具集：

### 倉儲物流

| 工具 | 用途 | 連結 |
|---|---|---|
| Warehouse Creator | 參數化快速生成倉庫場景 | [說明](https://docs.isaacsim.omniverse.nvidia.com/latest/digital_twin/warehouse_logistics/ext_omni_warehouse_creator.html) |
| 輸送帶工具 | 建立與設定輸送帶 | [說明](https://docs.isaacsim.omniverse.nvidia.com/latest/digital_twin/warehouse_logistics/ext_isaacsim_asset_gen_conveyor.html) |
| 靜態倉儲資產 | 貨架、棧板等現成資產 | [教學](https://docs.isaacsim.omniverse.nvidia.com/latest/digital_twin/warehouse_logistics/tutorial_static_assets.html) |
| NVIDIA cuOpt | GPU 加速的路徑／物流最佳化整合 | [教學](https://docs.isaacsim.omniverse.nvidia.com/latest/digital_twin/warehouse_logistics/logistics_tutorial_cuopt.html) |

### 其他數位孿生能力

- [占據地圖（Occupancy Map）生成](https://docs.isaacsim.omniverse.nvidia.com/latest/digital_twin/ext_isaacsim_asset_generator_occupancy_map.html)——從場景產生 2D 導航地圖。
- [RTSP 即時相機串流](https://docs.isaacsim.omniverse.nvidia.com/latest/digital_twin/rtsp_camera_streaming.html)——把模擬相機當成真實監控攝影機串流出去。
- [疑難排解](https://docs.isaacsim.omniverse.nvidia.com/latest/digital_twin/troubleshooting.html)。

### Isaac Cortex（決策框架）

以「決策網路（Decider Networks）」描述機器人任務邏輯的框架：

1. [總覽](https://docs.isaacsim.omniverse.nvidia.com/latest/cortex_tutorials/tutorial_cortex_1_overview.html) → 2. [Decider Networks](https://docs.isaacsim.omniverse.nvidia.com/latest/cortex_tutorials/tutorial_cortex_2_decider_networks.html) → 3. [行為範例：Peck Games](https://docs.isaacsim.omniverse.nvidia.com/latest/cortex_tutorials/tutorial_cortex_3_example_peck_games.html) → 4. [Franka 疊積木](https://docs.isaacsim.omniverse.nvidia.com/latest/cortex_tutorials/tutorial_cortex_4_franka_block_stacking.html) → 5. [UR10 箱體堆疊](https://docs.isaacsim.omniverse.nvidia.com/latest/cortex_tutorials/tutorial_cortex_5_ur10_bin_stacking.html) → 6. [建立 Cortex 擴充](https://docs.isaacsim.omniverse.nvidia.com/latest/cortex_tutorials/tutorial_cortex_7_cortex_extension.html)。

## 生態系全景

| 元件 | 角色 |
|---|---|
| Isaac Sim | 模擬、rig、SIL 驗證 |
| Isaac Lab | RL／IL 訓練 |
| [Lab-Arena](https://developer.nvidia.com/isaac/lab-arena) | 策略大規模評測 |
| [NuRec](https://developer.nvidia.com/omniverse/nurec) | 真實環境 Gaussian-splat 重建 → USD |
| [Cosmos Transfer](https://docs.nvidia.com/cosmos/latest/transfer2.5/index.html) | 渲染影像照片級增強 |
| Isaac ROS | GPU 加速 ROS 2 套件 |

---

*本頁為官方文檔中文導覽，內容以官方為準。*
