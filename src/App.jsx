import { useState } from "react";
import BarChart from "./components/BarChart";
import Nav from "./components/Nav";
import ScatterPlot from "./components/ScatterPlot";
import Heatmap from "./components/Heatmap";
import ChoroplethMap from "./components/ChoroplethMap";

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
    default:
      return null;
  }
};

const App = () => {
  const [currentPage, setCurrentPage] = useState(3);
  return (
    <>
      <Nav value={currentPage} setValue={setCurrentPage} />
      <Chart value={currentPage} />
    </>
  );
};

export default App;
