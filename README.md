# OpenReport Framework 

OpenReport is a premium, open-source Custom Reporting Framework designed to empower non-technical stakeholders to build, visualize, and schedule reports from complex operational data without engineering intervention. 

Designed originally with financial backoffice systems in mind, the architecture is generic enough to support any tabular data sources.

<p align="center">
  <img src="public/logo.svg" alt="OpenReport Logo" width="200"/>
</p>

<p align="center">
  <strong>Empowering non-technical users to build, visualize, and schedule reports without engineering intervention</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

##  Features
<a name="features"></a>

- **Dynamic Report Builder:** 3-step wizard to select data sources, columns, filters, sorting, and grouping.
- **Advanced Filtering Engine:** Type-aware operators (text, number, date) for precise data slicing.
- **Data Visualizer:** Built-in charting (Bar, Line, Pie) powered by Recharts that plots your report data instantly.
- **Aggregations & Grouping:** Group your data by any categorical column and see automatic aggregations (count, sum, average).
- **Scheduling UI:** Allow users to define daily, weekly, or monthly execution schedules.
- **Export & Share:** One-click CSV exports and easy link sharing.
- **Enterprise Dark Theme:** A sleek, high-contrast, and professional UI built with custom CSS (no heavy UI libraries required).

## Tech Stack
<a name="tech-stack"></a>

- **Frontend Core:** React 18, Vite
- **State Management:** React Context API (Reducer Pattern)
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **Styling:** Vanilla CSS (CSS Variables for theming)

##  Getting Started
<a name="getting-started"></a>

### Prerequisites

Ensure you have Node.js (v18+) and npm installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AarushAgarwal-dev/openreport-framework.git
   cd openreport-framework
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

##  Integrating Your Own Data

Out of the box, OpenReport uses a mock data generator (`src/data/mockData.js`). To integrate your real backend APIs:

1. **Define your sources:** Update the `dataSources` object in `mockData.js` (or move it to a dedicated config file) to define your available schemas.
2. **Fetch data:** Modify the `loadDataCache` logic in `src/context/ReportContext.jsx` to fetch from your REST endpoints or WebSockets instead of calling the mock generators.
3. **Handle Server-Side Operations:** If dealing with millions of rows, you can move the `engine/reportEngine.js` logic to your backend (e.g., translating the JSON report config into SQL or Elasticsearch queries) and implement server-side pagination.

##  Contributing
<a name="contributing"></a>

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License
<a name="license"></a>

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ by Aarush Agarwal</p>
