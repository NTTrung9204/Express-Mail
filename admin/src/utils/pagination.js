export const getPageNumber = (search) => {
  const params = new URLSearchParams(search);
  const page = params.get("page");
  return page ? parseInt(page, 10) : 1;
};

export const getPageNumbers = (current, total) => {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let last;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (last) {
      if (i - last === 2) rangeWithDots.push(last + 1);
      else if (i - last !== 1) rangeWithDots.push("...");
    }
    rangeWithDots.push(i);
    last = i;
  }

  return rangeWithDots;
};
