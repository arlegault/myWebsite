module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/mystyle.css");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("AL_headshot.jpeg");
  eleventyConfig.addPassthroughCopy("persistence.jpeg");
  eleventyConfig.addPassthroughCopy("city_tiers.jpeg");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: false,
    templateFormats: ["njk", "html"],
  };
};
