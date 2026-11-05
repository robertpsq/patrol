      (() => {
        let theme = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
        try {
          const saved = localStorage.getItem("lssd-theme");
          if (saved === "light" || saved === "dark") theme = saved;
        } catch (e) {
          console.warn("Could not read the saved theme preference:", e);
        }
        document.documentElement.dataset.theme = theme;
      })();
    
