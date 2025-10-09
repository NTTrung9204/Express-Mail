import React from "react";

const SearchBar = ({ value, onChange }) => (
  <input
    type="text"
    placeholder="Tìm kiếm người dùng..."
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full sm:w-1/2 px-3 py-2 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
  />
);

export default SearchBar;
