# IMU 感測器教學——驗證 AMR 運動是否符合預期

> 專為 **AMR（自主移動機器人）運動驗證**設計的 IMU 教學，適用 **Isaac Sim 6.0.x**，程式碼採用 **`isaacsim.sensors.experimental.physics`** Experimental API。對應官方 [IMU sensor](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/isaacsim_sensors_physics_imu.html) 章節。

**學習目標**：在 AMR 底盤掛上 IMU、讀取加速度／角速度／姿態；設計「直線加速 → 等速 → 原地旋轉」的已知運動剖面，把 IMU 讀值與模擬 ground truth、命令值互相比對並自動判定 PASS／FAIL；最後銜接 ROS 2，與實車 IMU 資料做 sim-to-real 驗證。

**參考官方頁面**：[IMU sensor](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/isaacsim_sensors_physics_imu.html)｜[isaacsim.sensors.experimental.physics API](https://docs.isaacsim.omniverse.nvidia.com/latest/py/source/extensions/isaacsim.sensors.experimental.physics/docs/index.html)｜[Isaac Sim Conventions](https://docs.isaacsim.omniverse.nvidia.com/latest/reference_material/reference_conventions.html)

> **6.0 重要變更**：`isaacsim.sensors.physics` 的 IMU 已棄用，請改用 **`isaacsim.sensors.experimental.physics`** 的 `IMU`（USD 建立）＋`IMUSensor`（執行期讀取）。舊 `sensorPeriod` 屬性同時棄用——新 API **每個物理步**都會讀取。

---

## 第 1 課：IMU 量什麼、能驗證什麼

IMU（慣性測量單元）模擬加速度計與陀螺儀，輸出三種資料，皆為感測器**本體座標系**的 x／y／z 分量（單位依 stage units，預設公尺）：

| 輸出 | 內容 | 單位 |
|---|---|---|
| `linear_acceleration` | 線加速度（含或不含重力，可選） | m/s² |
| `angular_velocity` | 角速度 | rad/s |
| `orientation` | 姿態四元數（**wxyz** 順序） | — |

用 IMU 驗證 AMR 運動的核心思路——**同一個運動量，用三種來源互相對照**：

| 檢核 | IMU 提供 | 比對對象 | 驗證什麼 |
|---|---|---|---|
| 靜止零點 | `lin_acc ≈ [0, 0, +9.81]`、`ang_vel ≈ 0` | 物理常數 | 感測器安裝方向、重力設定正確 |
| 直線加減速 | 加速度積分成速度 | ground truth 速度／輪速里程計 | 車體確實跟上速度命令、無打滑 |
| 原地旋轉 | 角速度 z 分量 | 下達的 yaw rate 命令 | 轉向控制正確 |
| 航向角 | 四元數換算 yaw | ground truth 朝向 | 姿態一致、無累積漂移 |

> 模擬中的「ground truth」可以直接讀物理引擎的位姿與速度（`RigidPrim.get_world_poses()`／`get_velocities()`）——這是模擬獨有的優勢。實車上沒有 ground truth，就改成「模擬 IMU vs 實車 IMU」的比對，見第 6 課。

先建立三個觀念：

1. **重力**：讀取時預設 `read_gravity=True`，靜止時加速度計會讀到約 `+9.81 m/s²`（z 軸向上）——和真實加速度計量「比力」的行為一致。要把加速度積分成速度時，改用 `read_gravity=False` 較方便。
2. **積分漂移**：加速度積分成速度、再積分成位移，誤差會隨時間累積。所以直線段驗證要用「短時間、已知剖面」，不要拿 IMU 長時間推算位置。
3. **必須掛在 Rigid Body 上**：IMU 要正確回報，必須附加在具剛體（Rigid Body）物理的 prim 上——掛錯位置最常見的症狀是讀值全為 0。

---

## 第 2 課：GUI 建立 IMU 與內建範例

在 GUI 中建立 IMU（[官方步驟](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/isaacsim_sensors_physics_imu.html#gui)）：

1. 確認場景有 Physics Scene（沒有就 **Create > Physics > Physics Scene**）。
2. 在 **Stage** 面板點選要掛 IMU 的 prim——AMR 請選**底盤的剛體 link**。
3. **Create > Sensors > Imu Sensor**，IMU 會成為該 prim 的子節點。
4. 點選 `Imu_Sensor` prim → **Property** 頁籤：**Transform** 調整安裝位置與朝向；**Raw USD Properties** 調整下表屬性。

| 屬性 | 說明 |
|---|---|
| `enabled` | 感測器開關 |
| `linearAccelerationFilterWidth` | 線加速度滾動平均視窗大小，調大輸出更平滑 |
| `angularVelocityFilterWidth` | 角速度滾動平均視窗大小 |
| `orientationFilterWidth` | 姿態滾動平均視窗大小 |
| `sensorPeriod` | 量測週期——**已棄用**，新 API 每個物理步都讀取 |

跑內建範例最快有感：**Window > Examples > Robotics Examples** → **Sensors > IMU Sensor > Load Scene**，按 **Play** 後用 `SHIFT + 左鍵` 拖動 Ant 模型，觀察加速度計與陀螺儀讀值變化；**Open Source Code** 可看官方怎麼用 Python API 掛感測器。

> **注意**：感測器是在按下 **Play** 時動態建立的；模擬進行中移動 IMU prim 會使感測器失效。要改階層（例如換父剛體）或改 filter width，請先 **Stop**、修改、再重新 Play。

---

## 第 3 課：Python API——建立與讀取

6.0 的寫法分兩層：`IMU` 負責建立／設定 USD prim（authoring），`IMUSensor` 負責執行期讀資料（runtime）：

```python
import numpy as np
from isaacsim.sensors.experimental.physics import IMU, IMUSensor

sensor = IMUSensor(
    IMU.create(
        "/World/AMR/imu",                                # 父路徑必須是剛體 prim
        translations=np.array([[0.0, 0.0, 0.15]]),       # 相對底盤的安裝位置
        orientations=np.array([[1.0, 0.0, 0.0, 0.0]]),   # wxyz
        linear_acceleration_filter_size=10,
        angular_velocity_filter_size=10,
        orientation_filter_size=10,
    )
)
```

> `translations`（父座標系）與 `positions`（世界座標系）**二選一**，不能同時給。若 prim 已存在，直接用 `IMU("/World/AMR/imu")` 包裝即可。

讀取有三種方式：

| 方式 | 回傳 | 適合 |
|---|---|---|
| `get_sensor_reading(read_gravity=True)` | C++ 結構：`is_valid`、`time`、`linear_acceleration_x/y/z`、`angular_velocity_x/y/z`、`orientation_w/x/y/z` | 最低開銷的逐步讀取 |
| `get_data(read_gravity=True)` | dict：`time`、`physics_step`、`linear_acceleration (3,)`、`angular_velocity (3,)`、`orientation (4,) wxyz` | Python 分析（本教學採用） |
| OmniGraph「Isaac Read IMU Node」 | 圖形節點輸出 | 不寫程式、銜接 ROS 2 |

```python
data = sensor.get_data(read_gravity=False)   # 不含重力，方便積分
print(data["linear_acceleration"])           # np.ndarray (3,)
print(data["angular_velocity"])              # np.ndarray (3,)
print(data["orientation"])                   # np.ndarray (4,)，wxyz
```

OmniGraph 讀法（GUI 工作流）：**Window > Graph Editors > Action Graph** 建立 `On Playback Tick → Isaac Read IMU Node → To String → Print Text` 四個節點，把 Isaac Read IMU Node 的 **IMU Prim** 指到你的 IMU，Play 後 Console 就會印出讀值（[官方圖解](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/isaacsim_sensors_physics_imu.html#omnigraph-workflow)）。

---

## 第 4 課：實戰——AMR 運動驗證腳本

完整 Standalone 腳本：用一個方塊當「簡化 AMR 底盤」，下達已知運動剖面（0–2 s 直線加速 → 2–4 s 等速 → 4–6 s 原地旋轉），每個物理步同步記錄 IMU 讀值與 ground truth，結束後自動比對並輸出 CSV。存成 `imu_verify.py` 後用 `./python.sh imu_verify.py`（Windows 用 `python.bat`）執行：

```python
from isaacsim import SimulationApp

simulation_app = SimulationApp({"headless": True})

import numpy as np
import omni.timeline
import omni.usd
from isaacsim.core.experimental.objects import Cube, GroundPlane
from isaacsim.core.experimental.prims import GeomPrim, RigidPrim
from isaacsim.sensors.experimental.physics import IMU, IMUSensor
from pxr import UsdPhysics

# ── 1) 場景：物理場景、地板、代表 AMR 底盤的方塊 ──
stage = omni.usd.get_context().get_stage()
UsdPhysics.Scene.Define(stage, "/World/PhysicsScene")
GroundPlane("/World/groundPlane", sizes=20, colors=np.array([0.5, 0.5, 0.5]))
Cube(
    "/World/AMR",
    positions=np.array([0.0, 0.0, 0.15]),
    scales=np.array([0.6, 0.4, 0.3]),        # 近似底盤尺寸（m）
    colors=np.array([0.2, 0.6, 0.9]),
)
chassis = RigidPrim("/World/AMR")
GeomPrim("/World/AMR", apply_collision_apis=True)

# ── 2) 底盤上掛 IMU ──
imu = IMUSensor(
    IMU.create(
        "/World/AMR/imu",
        translations=np.array([[0.0, 0.0, 0.15]]),
        orientations=np.array([[1.0, 0.0, 0.0, 0.0]]),
    )
)

# ── 3) 已知運動剖面：這就是「應該發生的運動」──
def command(t):
    """回傳 (前進速度 m/s, 原地角速度 rad/s)"""
    if t < 2.0:                      # 0–2 s：0→1 m/s 直線加速（a = 0.5 m/s²）
        return 0.5 * t, 0.0
    elif t < 4.0:                    # 2–4 s：1 m/s 等速
        return 1.0, 0.0
    else:                            # 4–6 s：原地旋轉 45°/s
        return 0.0, np.deg2rad(45.0)

def yaw_of(quat_wxyz):
    w, x, y, z = quat_wxyz
    return np.arctan2(2.0 * (w * z + x * y), 1.0 - 2.0 * (y * y + z * z))

# ── 4) 模擬迴圈：下命令 → 步進 → 同步記錄 IMU 與 ground truth ──
dt = 1.0 / 60.0                      # 預設物理步長
timeline = omni.timeline.get_timeline_interface()
timeline.play()
simulation_app.update()              # 感測器於 Play 後才建立

log = []
for i in range(int(6.0 / dt)):
    t = i * dt
    v_cmd, w_cmd = command(t)

    _, q = chassis.get_world_poses()                 # warp array → numpy
    yaw = yaw_of(q.numpy()[0])
    chassis.set_velocities(                          # 沿車頭方向下速度命令
        np.array([[v_cmd * np.cos(yaw), v_cmd * np.sin(yaw), 0.0]]),
        np.array([[0.0, 0.0, w_cmd]]),
    )

    simulation_app.update()                          # 物理前進一步

    data = imu.get_data(read_gravity=False)          # 不含重力，方便積分
    lin_gt, ang_gt = chassis.get_velocities()
    _, q_gt = chassis.get_world_poses()
    log.append((
        t, v_cmd, w_cmd,
        *data["linear_acceleration"], *data["angular_velocity"],
        yaw_of(data["orientation"]),
        *lin_gt.numpy()[0], *ang_gt.numpy()[0],
        yaw_of(q_gt.numpy()[0]),
    ))

timeline.stop()
arr = np.array(log)   # 欄位：t, v_cmd, w_cmd, ax, ay, az, wx, wy, wz,
                      #       yaw_imu, gt_vx, gt_vy, gt_vz, gt_wx, gt_wy, gt_wz, yaw_gt

# ── 5) 驗證 ──
n = int(4.0 / dt)                                    # 直線段（0–4 s）
v_imu = np.cumsum(arr[:n, 3]) * dt                   # 車體 x 加速度積分成速度
v_gt = np.linalg.norm(arr[:n, 10:12], axis=1)        # ground truth 平面速度
rmse_v = np.sqrt(np.mean((v_imu - v_gt) ** 2))

w_err = arr[n:, 8] - arr[n:, 2]                      # 旋轉段：IMU ωz vs 命令
rmse_w = np.sqrt(np.mean(w_err ** 2))

yaw_err = np.rad2deg(np.abs(np.unwrap(arr[:, 9]) - np.unwrap(arr[:, 16])).max())

print(f"[直線段] IMU 積分速度 vs ground truth  RMSE = {rmse_v:.3f} m/s")
print(f"[旋轉段] IMU 角速度  vs 命令          RMSE = {np.rad2deg(rmse_w):.2f} deg/s")
print(f"[全程]   IMU 航向    vs ground truth  最大誤差 = {yaw_err:.2f} deg")
ok = rmse_v < 0.05 and np.rad2deg(rmse_w) < 2.0 and yaw_err < 1.0
print("驗證結果：", "PASS" if ok else "FAIL（見第 5 課異常對策表）")

np.savetxt(
    "imu_verify_log.csv", arr, delimiter=",",
    header="t,v_cmd,w_cmd,ax,ay,az,wx,wy,wz,yaw_imu,"
           "gt_vx,gt_vy,gt_vz,gt_wx,gt_wy,gt_wz,yaw_gt",
    comments="",
)
print("已輸出 imu_verify_log.csv（可用 pandas / matplotlib 畫圖）")

simulation_app.close()
```

> **換成真正的 AMR**：把方塊換成你的機器人資產（Nova Carter、iw_hub 或自家 URDF 匯入的車體，見本站《機器人》章節），IMU 掛在**底盤剛體 link** 之下；速度命令改由差速控制器或輪關節速度下達——記錄與比對的程式完全不變。此時輪胎打滑、懸吊晃動、質量分佈都會反映在 IMU 讀值與命令的差異上，**這正是你要驗證的東西**：本課的「理想剛體」版本先確認驗證流程本身正確（門檻可設很嚴），再套到真車模型上看差異來自哪裡。

---

## 第 5 課：結果判讀——三個檢核

**檢核 A：靜止零點**。腳本開頭多跑 1–2 秒不下命令，用 `read_gravity=True` 讀取：`linear_acceleration` 應接近 `[0, 0, +9.81]`、`angular_velocity` 接近 `[0, 0, 0]`。不對就先別往下驗——多半是安裝方向或重力設定問題。

**檢核 B：直線段（0–4 s）**。IMU 車體 x 加速度應出現「0.5 m/s² 平台 → 0」的形狀；積分後的速度曲線應貼合 ground truth 的斜坡→平台。RMSE 小於門檻（範例設 0.05 m/s）即通過。注意積分漂移是常態——窗口越長誤差越大，屬正常物理。

**檢核 C：旋轉段（4–6 s）**。IMU 的 ωz 應為 45°/s 的平台，與命令的 RMSE 在幾 deg/s 內；同時 yaw（IMU 四元數換算）應以 45°/s 線性增加、與 ground truth 重合。

異常對策表：

| 現象 | 可能原因 | 對策 |
|---|---|---|
| 讀值全為 0／`is_valid` 為 False | IMU 沒掛在剛體上；還沒 Play 就讀取 | 掛到 rigid body prim；Play 之後再讀 |
| 靜止時 z 加速度不是 ~9.81 | stage 單位不是公尺；PhysicsScene 重力被改過 | 檢查 stage units 與重力設定 |
| 曲線毛刺很大 | 物理步長太大；filter width 太小 | 提高物理頻率；加大 `*FilterWidth`（改完要重新 Play） |
| 積分速度越來越飄 | 加速度積分的累積誤差（正常） | 縮短驗證窗；用 ground truth／里程計定期校正 |
| 旋轉時出現側向加速度 | IMU 不在旋轉中心，量到離心／切向加速度 | 這是**物理正確**的現象；旋轉驗證以 `angular_velocity` 為準，或把 IMU 移到旋轉軸上 |
| 改了 filter width 沒生效 | filter 在模擬啟動時由 C++ 端取值 | Stop → 改屬性 → 重新 Play |

---

## 第 6 課：銜接 ROS 2 與實車比對（sim-to-real）

模擬內部驗證通過後，最後一哩是回答「**和真實世界一致嗎？**」——讓模擬與實車跑同一段命令，比較兩邊的 IMU：

1. **模擬端發布 IMU**：Action Graph 串 `On Playback Tick → Isaac Read IMU Node → ROS2 Publish Imu`，topic 設為 `/imu`，即發布標準 `sensor_msgs/msg/Imu`（ROS 2 Bridge 需先啟用，見本站《ROS 2 整合》章節）。
2. **兩邊錄包**：模擬與實車執行同一段速度命令腳本，各自 `ros2 bag record /imu /odom`。
3. **對齊與比較**：以命令起點對齊時間戳，比較角速度／加速度的 RMSE、峰值、上升時間；也可以比較功率譜（實車會多出振動頻段）。
4. **解讀差異**：真實 IMU 有 bias、雜訊、溫漂，模擬 IMU 預設是乾淨的——所以比的是**趨勢與量級**（加速平台高度、轉彎角速度、到達時間），不要求逐點相等。若希望模擬更像實車，可在讀值後疊加你實測的 bias＋高斯雜訊模型。

差異來源的排查順序建議：命令執行（模擬器的控制器參數）→ 物理參數（質量、慣量、輪胎摩擦）→ 感測器安裝位置 → 感測器雜訊模型。

---

## 常見問題（FAQ）

- **Q：`get_data()` 回傳全是 0？** A：最常見兩個原因——IMU 的父 prim 不是剛體、或還沒按 Play。感測器是 Play 時才動態建立，讀取前至少先 `update()` 一步。
- **Q：靜止時 z 是 +9.81 不是 −9.81，正常嗎？** A：正常。加速度計量的是「比力」：靜止時支撐力抵抗重力，讀值為 +g（z 向上），與真實 IMU 一致。純運動加速度請用 `read_gravity=False`。
- **Q：舊程式 `from isaacsim.sensors.physics import IMUSensor` 還能跑嗎？** A：6.0 已標記棄用，請改 `isaacsim.sensors.experimental.physics`。新舊 API 對照見[遷移指南](https://docs.isaacsim.omniverse.nvidia.com/latest/migration_guides/isaac_sim_6_0/index.html)。
- **Q：IMU 更新頻率能設嗎？** A：舊 `sensorPeriod` 已棄用，新 API 固定**每個物理步**讀取——要改頻率就改物理步長，或在你的程式裡降採樣。
- **Q：想模擬真實 IMU 的雜訊？** A：模擬輸出預設乾淨（只有 filter 平滑）。可在讀值後自行疊加 bias＋高斯雜訊，參數用你實車 IMU 的 datasheet 或 Allan variance 實測值。

---

## 附錄：速查與參考連結

| 主題 | 連結 |
|---|---|
| IMU sensor 官方頁（本教學主要依據） | [sensors/isaacsim_sensors_physics_imu](https://docs.isaacsim.omniverse.nvidia.com/latest/sensors/isaacsim_sensors_physics_imu.html) |
| experimental.physics API 文件 | [isaacsim.sensors.experimental.physics](https://docs.isaacsim.omniverse.nvidia.com/latest/py/source/extensions/isaacsim.sensors.experimental.physics/docs/index.html) |
| 座標與單位慣例 | [Isaac Sim Conventions](https://docs.isaacsim.omniverse.nvidia.com/latest/reference_material/reference_conventions.html) |
| 4.x/5.x → 6.0 感測器遷移 | [Migration Guide](https://docs.isaacsim.omniverse.nvidia.com/latest/migration_guides/isaac_sim_6_0/index.html) |
| 感測器總覽（本站） | [sensors.html](sensors.html) |
| ROS 2 整合（本站） | [ros2.html](ros2.html) |
| 機器人匯入與設定（本站） | [robots.html](robots.html) |

---

*本頁為官方文檔中文教學導覽，內容以官方為準。*
