const nav = [
  { name: "Bar Chart", value: 0 },
  { name: "Scatter Plot", value: 1 },
  { name: "Heatmap", value: 2 },
  { name: "Choropleth Map", value: 3 },
];

const Nav = ({ value, setValue }) => {
  return (
    <div className="nav">
      <div>
        {nav.map((item) => (
          <button
            key={item.value}
            onClick={() => setValue(item.value)}
            style={{
              borderBottom: value === item.value ? "2px solid #000" : "none",
            }}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Nav;
