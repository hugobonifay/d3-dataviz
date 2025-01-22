import { useState } from "react";
import BarChart from "./components/BarChart";
import Nav from "./components/Nav";
import ScatterPlot from "./components/ScatterPlot";
import Heatmap from "./components/Heatmap";

const Chart = ({ value }) => {
  switch (value) {
    case 0:
      return <BarChart />;
    case 1:
      return <ScatterPlot />;
    case 2:
      return <Heatmap />;
    default:
      return null;
  }
};

const App = () => {
  const [currentPage, setCurrentPage] = useState(2);
  return (
    <>
      <Nav value={currentPage} setValue={setCurrentPage} />
      <Chart value={currentPage} />
    </>
  );
};

export default App;
