// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
//   theme: {
//     fontWeight: {
//       thin: "100",
//       extralight: "200",
//       light: "300",
//       normal: "400",
//       medium: "500",
//       semibold: "600",
//       bold: "700",
//       extrabold: "800",
//       black: "900",
//     },
//   },
//   plugins: [],
// };


/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontWeight: {
      thin: "100",
      extralight: "200",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
    },
    extend: {
      fontFamily: {
        prompt: ['"Prompt"', "sans-serif"],
        ancizar: ['"Ancizar Serif"', "serif"],
        cormorant: ['"Cormorant"', "serif"],
        inconsolata: ['"Inconsolata"', "monospace"],
        bodoni: ['"Bodoni Moda"', "serif"],
      },
    },

    //  extend: {
    //   fontFamily: {
    //     ancizar: ['"Ancizar Serif"', "serif"],
    //   },
    // },
  },
  plugins: [],
};

