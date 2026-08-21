<div align="right">
<a href="README.md">English</a> | 简体中文
</div>

<div align="center">
        
# GAUGE：面向仿真引擎与视频世界模型物理保真度的真实测量基准

**从视觉上的合理性，走向真实测量驱动的物理保真度。** *由[上海人工智能实验室](https://www.shlab.org.cn/) 发布。*


<p align="center">
<a href="https://internrobotics.github.io/GAUGE/"><img alt="Project Page" src="https://img.shields.io/badge/项目主页-GAUGE-1f6feb?style=for-the-badge&logo=readthedocs&logoColor=white"></a>
<a href="https://arxiv.org/abs/2608.05948"><img alt="arXiv" src="https://img.shields.io/badge/arXiv-GAUGE-1f6feb?style=for-the-badge&logo=arxiv&logoColor=white"></a>
<a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/License-MIT-1f6feb?style=for-the-badge&logo=opensourceinitiative&logoColor=white"></a>
<a href="https://huggingface.co/datasets/InternRobotics/GAUGE-Dataset"><img alt="HF Dataset" src="https://img.shields.io/badge/Huggingface-数据集-orange?style=for-the-badge&logo=huggingface&logoColor=white"></a>
</p>


<p align="center">
<img src="media/GAUGE-teaser.gif" width="900px" alt="GAUGE teaser">
</p>
</div>

> **视觉真实感并不等同于物理保真度。** GAUGE
> 评估物理引擎和视频世界模型能否复现真实世界中的物理行为，并进一步诊断*它们无法正确复现哪些物理机制*。

**GAUGE**
是一个以真实世界实验为基础的基准，用于评估**数值物理引擎**和**生成式视频世界模型**的物理保真度。

不同于主要依赖视觉相似度或人工判断的评估方式，GAUGE
将仿真或生成的动力学结果与**受控的真实世界实验**进行比较，并利用实测轨迹、标定后的物理参数、不确定性估计以及任务特定的物理观测量进行定量评估。

GAUGE 提供：

* **22 个受控物理任务族**
* **约 1,560 次真实世界动作捕捉实验**
* **覆盖刚体、柔性绳索、织物和三维体积可变形物体**
* **经实验标定的物理参数**
* **毫米级轨迹测量**
* **物理引擎与视频世界模型双评测赛道**
* **任务特定的诊断指标与标准化评测协议**

---

## 🔥 最新动态

* **2026-09** --- GAUGE 代码与评测工具包发布。
* **2026-08** --- 真实世界基准数据发布。
* **2026-08** --- 物理引擎与视频世界模型基线结果发布。

---

## 🌍 什么是 GAUGE？

物理仿真器正越来越广泛地应用于机器人学习、策略评估以及大规模合成数据生成。与此同时，生成式视频模型正在成为一种能够预测未来交互过程的隐式仿真器。

但一个基础问题仍然存在：

> **这些仿真器在多大程度上能够忠实地复现真实世界的物理规律？**

一段 rollout
即使在视觉上非常真实，仍可能具有错误的摩擦、加速度、动量传递、振荡周期、形变或能量行为。

GAUGE 通过将评测建立在**受控的真实世界物理实验**之上来解决这一问题。

每个任务均遵循以下评测流程：

**真实实验 → 物理测量 → 匹配仿真 / 视频生成 → 观测提取 → 物理评测**

因此，GAUGE 不再仅仅判断一段 rollout *看起来是否合理*，而是进一步回答：

1.  轨迹是否与真实世界动力学一致？
2.  运动是否遵循预期的物理定律？
3.  底层物理参数是否正确？
4.  动态行为在时间维度上是否稳定？
5.  哪一种物理机制导致了模型失效？

---

## ✨ GAUGE 有什么不同？

### 📏 基于真实测量

GAUGE 使用重复开展的真实世界实验，而不是由仿真器生成的参考轨迹。

实验通过高精度动作捕捉系统记录，并配套提供经过标定的物理元数据。

### 🧩 跨物理形态评测

一个基准覆盖多种不同的物理形态：

| 物理形态                | 任务数 | 代表性物理现象                |
| ---------------------- | -------:| -------------------------   |
| 刚体                   |      8 | 碰撞、摩擦、动量传递、振荡      |
| 柔性绳索               |      1 | 自接触、拉伸                   |
| 织物                    |     6 | 拉伸、弯曲、摩擦、快速动态运动  |
| 三维体积可变形物体        |    7 | 拉伸、压缩、剪切、扭转、弯曲    |


### ⚙️ 物理引擎 + 🌐 世界模型

GAUGE 基于统一的真实世界实验基础，对两类互补的仿真系统进行评测：

**物理仿真引擎赛道（Simulation-Engine Track）**

> 真实实验 → 匹配的仿真场景 → 仿真轨迹 → Sim-to-Real 评测

**视频世界模型赛道（Video World Model Track）**

> 初始图像 + Prompt → 生成视频 → 运动提取 → 物理定律评测

### 🔬 不只是排名，更强调诊断

GAUGE 的目标是识别仿真器*为什么会失败*。

评测维度包括轨迹误差、时间对齐、动量传递、振荡、力---运动一致性、方程形式一致性以及物理参数准确性。

---

## 🧪 基准任务

GAUGE 包含 **22 个标准化任务族**。

### 刚体

|任务                              | 物理属性          | 材料                |
|--------------------------------- | ----------------- | ------------------ |
|斜面接触（Slope Contact）         | 碰撞               | 木材、塑料       |
|非光滑接触（Nonsmooth Contact）   | 余维碰撞           | 木材、塑料        |
|斜面滑块（Slope Slider）          | 静摩擦与动摩擦     | 木材、塑料、金属   |
|转盘（Turntable）                 | 非惯性系中的摩擦   | 木材、塑料、金属   |
|弹跳球（Bouncing Ball）           | 快速冲击           | 橡胶             |
|牛顿摆（Newton's Cradle）         | 动量传递           | 金属             |
|撞墙（Wall Breaking）             | 大规模密集碰撞     | 木材             |
|单摆（Pendulum）                  | 周期运动           | 金属            |

### 柔性绳索与织物

|任务                            | 物理属性              |
|------------------------------- | -------------------- |
|绳索缠绕（Rope Winding）        | 自碰撞与拉伸模量       |
|织物拉伸（Textile Stretching）  | 拉伸模量               |
|织物弯曲（Textile Bending）     | 弯曲模量               |
|织物甩动（Textile Flinging）    | 高加速度形变           |
|漏斗（Funnel）                  | 碰撞与摩擦             |
|旋转球（Rotating Ball）         | 静摩擦与动摩擦          |
|抽桌布（Tablecloth Pulling）    | 刚体-织物交互与摩擦   |

织物材料包括人造棉（rayon）、色丁（satin）、制服呢（uniform
cloth）、牛津布（Oxford fabric）、合成皮革（synthetic
leather）和尼龙塔丝（nylon taslan）。

### 三维体积可变形物体

|任务                        |   物理属性
|----------------------------| --------------
|海绵拉伸（Foam Stretching）  |  拉伸模量
|海绵压缩（Foam Compressing） |  压缩模量
|海绵剪切（Foam Shearing）    | 剪切模量
|海绵扭转（Foam Twisting）    | 扭转模量
|海绵弯曲（Foam Bending）     | 弯曲模量
|粘滞摩擦 (Stick-Stack)       | 静摩擦与动摩擦
|悬臂梁（Cantilever Beam）    | 大刚度比耦合

---

## 📦 数据集

GAUGE 的每个任务均以重复开展的真实物理实验为基础。

数据集包含约 **1,560
次动作捕捉实验**，并提供经标定的物理属性和不确定性估计。

### 真实世界测量

对于刚体对象：

``` text
局部坐标系
        ↓
随时间变化的 6-DoF 位姿轨迹
```

对于织物和三维体积可变形物体：

``` text
跟踪表面标记点
        ↓
随时间变化的位置轨迹
```

### 物理元数据

根据具体任务和材料，GAUGE 提供经实验测定的物理量，包括：

* 几何尺寸
* 质量
* 密度
* 摩擦
* 恢复系数
* 拉伸刚度
* 剪切刚度
* 弯曲刚度
* 杨氏模量
* 泊松比

### 项目结构

GAUGE 由一组相互协作的代码仓库组成。本仓库是整个项目的主要入口：

| 组件 | 仓库地址 | 提供内容 |
| --- | --- | --- |
| GAUGE（本仓库） | InternRobotics/GAUGE | 基准实现、评测脚本以及项目入口 |
| GAUGE-Dataset | 🤗 GAUGE-Dataset | 场景、任务资产、物理元数据以及实测轨迹（JSON 格式） |

```
GAUGE/
├── scripts/                    # GAUGE 各评测赛道的评测脚本
│   ├── simulation/             # 物理引擎仿真
│   └── metrics/                # 轨迹指标、任务特定物理指标以及 Sim-to-Real 评测
│
├── media/                      # README 图片与任务可视化资源
├── LICENSE                     # 项目许可证
└── README.md                   # 基准概览、配置、评测与使用说明
```

---

## ⚙️ 物理仿真引擎赛道

物理仿真引擎赛道评估数值仿真器在匹配初始条件和物理参数的情况下，能否复现实测的真实世界动力学。

<p align="center">
<img src="media/PE track.png" width="100%">
</p>

GAUGE 当前在代表性任务上评测以下物理引擎：

|物理引擎                                                                      | 刚体       | 织物             | 可变形物体         |
|----------------------------------------------------------------------------- | ---------- | ---------------- | ---------------- |
|[IsaacSim](https://docs.isaacsim.omniverse.nvidia.com/6.0.0/index.html)       | PhysX      | Surface FEM      | FEM              |
|[Genesis](https://genesis-world.readthedocs.io/en/v1.2.2/index.html)          | Default    | PBD              | Explicit MPM     |
|[Newton](https://newton-physics.github.io/newton/1.3.0/guide/overview.html)   | Mujoco     | VBD              | Implicit MPM     |

物理参数直接采用 GAUGE
的实验标定结果进行初始化，而不是针对特定任务进行仿真器参数拟合。

### 广义轨迹

针对不同类别的对象，GAUGE 使用与任务相匹配的物理观测量进行表示：

|对象                 | 表示方式          |
|-------------------- | ---------------- |
|刚体                 | 位置             |
|织物                 | 标记点的高斯曲率  |
|体积可变形物体   | 局部网格面面积     |

这种设计既能在统一的轨迹评测框架下比较不同物理形态，又能保留具有物理意义的状态表示。

### 评测指标

核心指标包括：

* **RMSE** --- 衡量仿真轨迹与真实世界平均轨迹之间逐帧对齐的误差。

* **DTW** --- 动态时间规整误差，允许进行单调的时间对齐。

此外，任务特定指标包括：

* **LSD** --- 最长静止持续时间（Longest Stationary Duration）
* **MTE** --- 动量传递效率（Momentum Transfer Efficiency）
* **PD** --- 振荡周期（Period Duration）
* **EL** --- 能量损失（Energy Loss）

---

## 🌐 视频世界模型赛道

世界模型赛道关注另一个问题：

> 生成模型真正学习到了底层物理规律，还是仅仅学会了物理运动"应该看起来是什么样子"？

<p align="center">
<img src="media/WM track.png" width="100%">
</p>

对生成视频中的目标物体进行逐帧分割与跟踪，随后将像素空间中的轨迹转换到物理坐标系。

|世界模型  |  [Cosmos3-Nano](https://research.nvidia.com/labs/cosmos-lab/cosmos3/) | [Cosmos3-Super](https://research.nvidia.com/labs/cosmos-lab/cosmos3/) | [Wan-2.2](https://tongyi.aliyun.com/wan/) | [Wan-2.7](https://www.aliyun.com/benefit/scene/wan) | [Seedance-2.0](https://www.volcengine.com/activity/seedance2?utm_source=5&utm_medium=sem_bing&utm_term=sem_bing_seedance20_dpcx_gw_tcpa&utm_campaign=76554087640442&utm_content=seedance20_gw_dpcx&msclkid=6f4b574ade8518c8c0473dceec6f04b7) | [Genie3](https://labs.google/projectgenie?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=) |
| :----: | :----: | :----: | :----: | :----: | :----: | :----: |
| 正向提示词 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |                                
| 负向提示词 | ✓ | ✓ | ✓ | ✓ | × | × |

### 评测指标

GAUGE 将**物理定律结构**与**物理参数准确性**分开评估。

#### 物理定律结构

* **动力学误差 (DE)** --- 衡量预测运动与预期力---运动关系之间的一致性。

* **决定系数 (R²)** --- 衡量预期控制方程对生成轨迹的解释程度。

* **二次型修正 (QFI)** --- 检验对于本应遵循较简单物理关系的运动，是否需要额外的高阶曲率项才能进行解释。

#### 物理参数

任务特定的物理参数包括：

* **加速度**
* **动量传递效率**
* **振荡周期**
* **阻尼**

这些参数从生成轨迹中恢复，并与真实实验测量值进行比较。

这种区分十分重要，因为生成轨迹可能符合物理定律的**形式**，但恢复出的**物理参数仍然是错误的**。

---

## 📊 基准结果

### 物理引擎

我们使用以下物理引擎对 GAUGE 的代表性任务进行评测：

|引擎        | 刚体  | 织物  | 体积可变形物体 |
|----------- | :------: | :------: | :-------------: |
|Isaac Sim   |  ✓     | ✓     |        ✓      |
|Genesis     |  ✓     | ✓     |        ✓      | 
|Newton      |  ✓     | ✓     |        ✓      |

一个核心发现是：**没有任何单一物理引擎能够在所有物理形态上都保持一致的高保真度**。

标准接触与滑动行为通常能够被较好地复现，但以下场景中会出现明显更大的误差：

-   冲击接触，
-   高加速度织物运动，
-   三维体积形变。

### 视频世界模型

GAUGE 还在刚体物理任务上评估了代表性的图生视频模型和交互式世界模型。

结果揭示了一个重要区别：

> **模型可以生成在方程形式上看似正确的运动，却预测出错误的物理参数。**

例如，即使生成运动在视觉上看起来合理，其加速度、动量传递、振荡周期和阻尼仍可能明显错误。

---

## 🔎 如何理解评测结果

GAUGE 的定位是一个**诊断型基准**，而不仅仅是排行榜。

可以按照以下方式理解评测结果：

``` text
高视觉质量
      │
      ├── 方程形式是否正确？
      │       │
      │       ├── 否 → 物理结构性失效
      │       │
      │       └── 是
      │            │
      │            ├── 物理参数是否正确？
      │            │       └── 否 → 定量物理失效
      │            │
      │            └── 时间动态是否正确？
      │                    └── 否 → 动力学 / 稳定性失效
      │
      └── 与真实实验不确定性进行比较
```

因此，GAUGE 的目标并不只是回答：

> **哪个仿真器的分数最高？**

而是回答：

> **每个仿真器能够忠实复现哪些物理机制，又在哪些方面偏离了真实世界？**

---

## 🛣️ 路线图

未来版本的 GAUGE 计划从以下方向扩展：

-   更多材料以及更广泛的物理参数范围，
-   更多刚体 / 可变形物体交互场景，
-   流体动力学，
-   流体-刚体交互，
-   流体-软体交互，
-   三维世界模型评测，
-   基于重建点云和网格的评测指标，
-   应变、曲率、弯曲能和能量耗散分析。

---

## 📝 引用

如果 GAUGE 对您的研究有所帮助，请考虑引用：

``` bibtex
@article{Wang2026,
  title={GAUGE: A Measurement-Grounded Benchmark for Physical Fidelity in Simulation Engines and Video World Models},
  author={Wang, Shuai and Feng, Yaxin and Jiang, Xuekun and Tian, Shihan and others},
  year={2026},
  copyright = {arXiv.org perpetual, non-exclusive license},
  doi       = {10.48550/ARXIV.2608.05948},
  keywords  = {Artificial Intelligence (cs.AI), Computer Vision and Pattern Recognition (cs.CV), Robotics (cs.RO), FOS: Computer and information sciences},
  publisher = {arXiv},
}
```

---

## 📄 许可证

本项目采用 MIT License，详情请参阅 [LICENSE](LICENSE) 文件。
