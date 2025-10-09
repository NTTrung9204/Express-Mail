import React from "react";

const SearchBar = ({ value, onChange }) => (
  <input
    type="text"
    placeholder="Tìm kiếm người dùng..."
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full md:w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
  />
);

export default SearchBar;
