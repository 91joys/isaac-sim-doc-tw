# ROS 2 整合（ROS 2）

> 對應官方 [ROS 2](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/ros2_landing_page.html) 章節的中文導覽。Isaac Sim 透過 **ROS 2 Bridge** 讓模擬世界成為 ROS 2 生態的一個節點：發布感測器資料、訂閱控制命令、以服務控制模擬本身。

---

## 核心概念

- **ROS 2 Bridge** 以 **OmniGraph 節點**實作：相機發布器、TF 發布器、Twist 訂閱器等都是圖上的節點，用 GUI 或 Python 建圖即可接上 ROS 2。
- 支援 **Linux 與 Windows**；先完成 [ROS 2 安裝（預設）](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/install_ros.html)或[其他平台版本](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/install_ros_other_platforms.html)。
- Standalone 工作流程也能用 bridge（[ROS 2 Bridge in Standalone Workflow](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_python.html)），可精準控制發布時序。
- 架構建議見 [ROS 2 Reference Architecture](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/ros2_reference_architecture.html)。

## 建議學習路徑

1. **TurtleBot 系列**（入門主線）：[URDF 匯入 TurtleBot](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_turtlebot.html) → [用 ROS 2 訊息駕駛](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_drive_turtlebot.html) → [Clock 時鐘同步](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_clock.html) → [TF 樹與里程計](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_tf.html)。
2. **感測器發布**：[相機](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_camera.html)（含[發布細節](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_camera_publishing.html)、[加噪聲](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_camera_noise.html)、[壓縮影像](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_compressed_image.html)）、[RTX 光達](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_rtx_lidar.html)、[RTX 雷達](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_rtx_radar.html)。
3. **品質與時序**：[發布頻率設定](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_publish_rate.html)、[QoS](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_qos.html)、[RTF 即時係數發布](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_rtf.html)。
4. **導航與操作**：[Nav2 導航](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_navigation.html)、[多機器人導航](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_multi_navigation.html)、[高度圖導航](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_navigation_heightmap.html)、[MoveIt 2](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_moveit.html)、[關節控制（Extension Python）](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_manipulation.html)、[Ackermann 控制器](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_ackermann_controller.html)。
5. **進階整合**：[以 ROS 2 服務控制模擬](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_simulation_control.html)（載入世界、生成實體、步進）、[透過 ROS 2 執行 RL 策略](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_rl_controller.html)、[綜合應用 Putting It All Together](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_putting_it_all_together.html)。

## 自訂與擴充

| 主題 | 連結 |
|---|---|
| 泛用 Publisher／Subscriber | [教學](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_generic_publisher_subscriber.html) |
| 泛用 Server／Client | [教學](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_generic_server_client.html) |
| 以服務操作 Prim 屬性 | [教學](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_prim_service.html) |
| Python 自訂訊息 | [教學](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_custom_message_python.html) |
| 自訂 OmniGraph 節點（Python／C++） | [Python](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_custom_omnigraph_node_python.html)｜[C++](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_omnigraph_cpp_node.html) |
| ROS 2 Launch 整合 | [教學](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_launch.html) |
| 命名空間自動生成／NameOverride | [自動命名空間](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_auto_namespace.html)｜[NameOverride](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/tutorial_ros2_name_override.html) |

## NVIDIA Isaac ROS

[Isaac ROS 教學](https://docs.isaacsim.omniverse.nvidia.com/latest/nvidia_isaac_ros/isaac_ros_tutorials.html)：NVIDIA 提供的 GPU 加速 ROS 2 套件（VSLAM、感知、操作），可與 Isaac Sim 做軟體在環驗證。

## 疑難排解

- [ROS 2 FAQ](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/ros2_faq.html)
- [ROS 2 Troubleshooting](https://docs.isaacsim.omniverse.nvidia.com/latest/ros2_tutorials/troubleshooting.html)——bridge 載不進來、topic 看不到、時鐘不同步等常見問題。

---

*本頁為官方文檔中文導覽，內容以官方為準。*
