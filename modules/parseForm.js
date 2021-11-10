const parseInitialFormData = ($) => {
  let form = $("form");
  let select = form.find("select");
  let input = form.find('input[type!="submit"][type!="checkbox"]');

  let data = {};

  input.each((i, elem) => {
    if ($(elem).attr("name"))
      data[$(elem).attr("name")] = $(elem).attr("value") || "";
  });

  select.each((i, elem) => {
    if ($(elem).attr("name"))
      data[$(elem).attr("name")] = $(elem)
        .find($('[selected="selected"]'))
        .attr("value");
  });
  return data;
};

const parseSelector = ($) => {
  let data = {};
  let form = $("form");
  let select = form.find("select");

  select.each((i, elem) => {
    let options = $(elem).find($("option[selected]"))[0];
    data[$(elem).attr("name")] =
      (options && $(options).attr("value")) || undefined;
  });

  return data;
};

module.exports = {
  parseInitialFormData,
  parseSelector,
};
