<p align="center">
  <img src="cartaz.png" alt="Rifa Solidária — Ajude a Sasá" width="360" />
</p>

<h1 align="center">Rifa Solidária — Ajude a Sasá 🐱</h1>

<p align="center">
  Página web para gerenciar e divulgar uma rifa solidária em prol da gatinha Sasá,
  que precisou de uma cirurgia de emergência por doença renal crônica.
</p>

<p align="center">
  <a href="https://thalesrochas.github.io/rifa-sasa">
    <img src="https://img.shields.io/badge/Acesse%20a%20rifa-f4845f?style=for-the-badge&logo=github" alt="Acesse a rifa" />
  </a>
</p>

---

## Sobre o projeto

Na última segunda-feira (13/04/2026), a Sasá foi diagnosticada com **doença renal crônica** e um dos rins obstruído. A cirurgia — substituição do ureter por um *bypass* — se tornou urgente. Entre consultas, exames, internações e o procedimento, os gastos ultrapassaram **R$ 10.000**.

Esta página foi criada para organizar a rifa e facilitar a participação de quem quiser ajudar.

## Como funciona

| Detalhe | Valor |
|---|---|
| Números disponíveis | 150 |
| Valor por número | R$ 10 |
| Prêmio | Cubo Mágico 7×7 Moyu Meilong V2M Magnético |
| Envio | Para todo o Brasil |
| Sorteio | Loteria Federal — 3 últimos dígitos do 1º prêmio |

O participante escolhe um ou mais números na página, realiza o PIX e envia o comprovante via WhatsApp com os números já pré-preenchidos na mensagem.

Os números vendidos são lidos em tempo real a partir de uma planilha do Google Sheets (atualização automática a cada 60 segundos).

## Estrutura

```
rifa-sasa/
├── index.html        # página principal da rifa
├── cartaz.html       # cartaz para divulgação (Stories / WhatsApp)
├── cartaz.png        # imagem exportada do cartaz
├── css/
│   └── stylesheet.css
├── js/
│   └── script.js
└── img/
    ├── foto1.jpg
    ├── foto2.jpg
    ├── foto3.jpg
    ├── premio1.jpg … premio5.jpg
```

## Tecnologias

- HTML, CSS e JavaScript puro — sem dependências ou frameworks
- Google Sheets como backend simples para controle de números vendidos
- Deploy via **GitHub Pages**

## Desenvolvido por

[Thales Rocha](https://github.com/thalesrochas)
