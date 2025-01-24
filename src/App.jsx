import { useState } from "react";
import BarChart from "./components/BarChart";
import Nav from "./components/Nav";
import ScatterPlot from "./components/ScatterPlot";
import Heatmap from "./components/Heatmap";
import ChoroplethMap from "./components/ChoroplethMap";
import PatentSuits from "./components/PatentSuits";
import TreemapDiagram from "./components/TreemapDiagram";

const Chart = ({ value }) => {
  switch (value) {
    case 0:
      return <BarChart />;
    case 1:
      return <ScatterPlot />;
    case 2:
      return <Heatmap />;
    case 3:
      return <ChoroplethMap />;
    case 4:
      return <TreemapDiagram />;
    case 5:
      return <PatentSuits />;
    default:
      return null;
  }
};

const App = () => {
  const [currentPage, setCurrentPage] = useState(4);
  return (
    <>
      <Nav value={currentPage} setValue={setCurrentPage} />
      <Chart value={currentPage} />
    </>
  );
};

export default App;
