# 中文文檔大全

技術文檔的繁體中文整理站。

## 網站結構

```
docs/
├── index.html      ← 主頁「中文文檔大全」：選擇要進入的文檔庫
├── isaac/          ← Isaac Sim 中文文檔（NVIDIA Isaac Sim 6.0.1）
│   ├── index.html      Isaac 首頁
│   ├── docs.html       總覽文檔（10 章）
│   ├── tutorial.html   Script Editor 教學等四大實戰教學
│   ├── …               10 個專題章節頁
│   └── note/           Markdown 原稿
├── isaaclab/       ← Isaac Lab 中文文檔（建構於 Isaac Sim 的機器人學習框架）
│   ├── index.html      Isaac Lab 首頁
│   ├── docs.html       總覽文檔（9 章）
│   ├── installation.html 安裝與部署（四種安裝路徑、容器與雲端）
│   ├── concepts.html   核心概念與架構（五層架構、雙工作流程、致動器、感測器）
│   ├── tutorials.html  教學系列（六大主題循序實戰）
│   ├── environments.html 可用環境（任務類別與命名慣例）
│   └── rl.html         強化學習（RSL-RL／RL-Games／SKRL／SB3）
├── newton/         ← Newton Physics 中文文檔（Newton 1.3.0）
│   ├── index.html      Newton 首頁
│   ├── docs.html       總覽文檔
│   ├── installation.html 安裝與快速入門
│   ├── concepts.html   核心概念（Worlds、Articulation、慣例…）
│   ├── solvers.html    求解器（8 種求解器比較）
│   ├── collisions.html 碰撞與接觸
│   ├── sensors.html    感測器與致動器
│   ├── visualization.html 視覺化
│   ├── tutorials.html  教學與範例
│   └── faq.html        FAQ・整合・遷移
├── warp/           ← NVIDIA Warp 中文文檔（Warp 1.14.0）
│   ├── index.html      Warp 首頁
│   ├── docs.html       總覽文檔
│   ├── installation.html 安裝與快速入門
│   ├── basics.html     基礎入門（kernel、array、struct）
│   ├── runtime.html    執行期核心功能（CUDA Graph、Mesh、Volume…）
│   ├── devices.html    裝置・串流・並行
│   ├── differentiability.html 可微分性（wp.Tape、Jacobian）
│   ├── tiles.html      Tile 程式設計（Tensor Core）
│   ├── generics.html   泛型與程式碼生成
│   ├── interop.html    互操作性（PyTorch、JAX、DLPack）
│   ├── modules.html    領域模組（sparse、fem、render）
│   └── faq.html        FAQ・除錯・限制
├── physicsnemo/    ← NVIDIA PhysicsNeMo 中文文檔（26.05／v2.x，前身 Modulus）
│   ├── index.html      PhysicsNeMo 首頁
│   ├── docs.html       總覽文檔（核心元件、生態系、官方文檔架構對照）
│   ├── installation.html 安裝與快速入門（容器、pip/uv、extras 相依群組）
│   ├── training.html   訓練工作流程（FNO×Darcy2D、自訂模型、日誌與 checkpoint）
│   ├── models.html     模型架構（GNN、Transformer、神經算子、擴散、Voxel）
│   ├── physics.html    物理引導與 PINNs（physicsnemo.sym、PhysicsInformer）
│   ├── mesh.html       PhysicsNeMo-Mesh（GPU 網格模組、DomainMesh）
│   ├── distributed.html 分散式與領域平行（DistributedManager、ShardTensor）
│   ├── performance.html 效能最佳化（Profiling、torch.compile、最佳化層）
│   ├── ecosystem.html  領域套件與資料策展（Curator、CFD、Earth2Studio、主動學習）
│   ├── api.html        API 模組地圖（15 個子模組全架構）
│   └── examples.html   範例目錄（37+ 官方訓練配方分類導覽）
├── pbdl/           ← Physics-Based Deep Learning 中文導讀（Thuerey 團隊專書）
│   ├── index.html      PBDL 首頁
│   ├── docs.html       總覽（緒論）：方法框架、正／反問題、常用 PDE
│   ├── surrogates.html 神經代理與算子（監督式學習）
│   ├── physical-losses.html 物理損失項（PINN）
│   ├── diffphys.html   可微分物理
│   ├── probabilistic.html 機率式與生成學習（擴散、流匹配）
│   ├── rl.html         強化學習（PPO 控制 PDE）
│   └── gradients.html  改良梯度與快速主題
└── ndpi/           ← nDPI 中文文檔（nDPI 5.0）
    ├── index.html      nDPI 首頁
    ├── docs.html       總覽文檔
    ├── installation.html 編譯與快速上手
    ├── architecture.html 核心架構
    ├── detection.html  偵測管線與策略
    ├── flow.html       Flow 追蹤與生命週期
    ├── protocol.html   協定堆疊與信心等級
    ├── risk.html       風險評估系統
    ├── dissectors.html 協定解析器
    ├── datastructures.html 資料結構與演算法
    ├── integration.html 整合到你的應用程式
    ├── extend.html     擴充新協定
    └── resources.html  學習資源
```

直接開啟 `docs/index.html` 即可瀏覽。

## 資料來源

- [Isaac Sim 官方文檔](https://docs.isaacsim.omniverse.nvidia.com/latest/index.html)（6.0.1）
- [Isaac Lab 官方文檔](https://isaac-sim.github.io/IsaacLab/main/index.html)（main）
- [Newton Physics 官方文檔](https://newton-physics.github.io/newton/stable/guide/overview.html)（1.3.0，CC-BY-4.0）
- [NVIDIA Warp 官方文檔](https://nvidia.github.io/warp/v1.14/index.html)（1.14.0）
- [NVIDIA PhysicsNeMo 官方文檔](https://docs.nvidia.com/physicsnemo/latest/index.html)（26.05／latest）
- [Physics-Based Deep Learning](https://physicsbaseddeeplearning.org/intro.html)（N. Thuerey 等，TUM Physics-based Simulation Group，v0.3）
- [ntop/nDPI 官方 GitHub](https://github.com/ntop/nDPI) 與 [DeepWiki](https://deepwiki.com/ntop/nDPI)（nDPI 5.0，索引 2025-12-05）

內容如與最新版官方文檔不符，請以官方為準。本站為非官方學習資源。
