[![x](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=X&logoColor=white)](https://twitter.com/t_h_e_u)
[![linkedin](https://img.shields.io/badge/Linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/matheusgbatista/)
[![web](https://img.shields.io/badge/web-000000?style=for-the-badge&logo=web&logoColor=white)](https://t-heu.github.io)

## Getting Started

First, run command:

```bash
npm install
```

Second, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

![Logo](docs/logo.png "logo")

"Bugs" é um minigame de ação em tempo real onde o jogador controla um inseto em um campo de batalha (arena) cheio de outros bots controlados por IA. O objetivo é coletar comida espalhada pelo mapa, crescer em tamanho e enfrentar outros insetos em combates estratégicos.

## 🖼️ Preview
![Screen 1](docs/preview.png "Screen 1")
![Screen 2](docs/image2.png "Screen 2")
![Screen 2](docs/image0.png "Screen 2")
![Screen 2](docs/image.png "Screen 2")

## Cálculo de "requiredScore"

Fórmula de poder relativa para calc. "requiredScore".

poder = (speed * 0.5) + (attack * 1.2) + (health * 0.3)

Tier 0: até ~25 de poder → requiredScore: 0
Tier 1: 25–30 → requiredScore: 200–400
Tier 2: 30–35 → requiredScore: 500–700
Tier 3: 35–42 → requiredScore: 800–1000
Tier 4: 42–46 → requiredScore: 1100–1300
Tier 5: 46+ → requiredScore: 1400+
