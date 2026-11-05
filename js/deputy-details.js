        (function () {
          var root = document.getElementById("f-deputy");
          function g(id) { return document.getElementById(id); }
          function savedMatches(cur) {
            try {
              var s = JSON.parse(localStorage.getItem("lssd-deputy-details") || "null");
              if (!s) return false;
              return (s.fullName || "") === cur.fullName && (s.badgeNumber || "") === cur.badge &&
                (s.rank || "") === cur.rank && (s.bureau || "") === cur.bureau && (s.callsign || "") === cur.call;
            } catch (e) { return false; }
          }
          // MDC photo: debounced (same delay as person photo lookups), shown only after a real load.
          var photoName = "", photoTimer = 0, photoReq = 0;
          function showPhoto(url) {
            var img = g("dp-photo"), av = g("dp-avatar");
            if (!url) { img.hidden = true; img.removeAttribute("src"); av.classList.remove("has-photo"); return; }
            var probe = new Image(), req = ++photoReq;
            probe.onload = function () {
              if (req !== photoReq) return;
              img.src = url; img.hidden = false; av.classList.add("has-photo");
            };
            probe.onerror = function () { if (req === photoReq) showPhoto(""); };
            probe.src = url;
          }
          function syncPhoto(name) {
            if (name === photoName) return;
            photoName = name;
            clearTimeout(photoTimer);
            photoReq++;
            showPhoto("");
            if (!name || typeof personImageUrl !== "function") return;
            photoTimer = setTimeout(function () {
              if (name === photoName) showPhoto(personImageUrl(name));
            }, typeof PERSON_PHOTO_LOOKUP_DELAY === "number" ? PERSON_PHOTO_LOOKUP_DELAY : 1000);
          }
          function update() {
            var cur = {
              fullName: g("deputy-full-name").value.trim(),
              badge: g("deputy-badge-number").value.trim().replace(/^#/, ""),
              rank: g("deputy-rank").value,
              bureau: g("deputy-bureau").value.trim(),
              call: g("deputy-callsign").value.trim(),
            };
            var parts = cur.fullName.split(/\s+/).filter(Boolean);
            var ini = parts.length ? (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")) : "?";
            g("dp-ini").textContent = ini;
            syncPhoto(cur.fullName);
            var n = g("dp-name");
            n.textContent = cur.fullName || "Your name";
            n.classList.toggle("empty", !cur.fullName);
            var sub = [cur.rank, cur.bureau].filter(Boolean).join(" · ");
            var s = g("dp-sub");
            s.textContent = sub || "Rank and bureau appear here";
            s.classList.toggle("empty", !sub);
            var b = g("dp-chip-badge"), c = g("dp-chip-call"), st = g("dp-chip-state");
            b.hidden = !cur.badge; b.textContent = "Badge #" + cur.badge;
            c.hidden = !cur.call; c.textContent = "Callsign " + cur.call;
            var any = cur.fullName || cur.badge || cur.rank || cur.bureau || cur.call;
            var saved = any && savedMatches(cur);
            st.classList.toggle("saved", !!saved);
            st.textContent = saved ? "Saved" : any ? "Unsaved changes" : "Not saved yet";
          }
          root.addEventListener("input", update);
          root.addEventListener("change", update);
          root.addEventListener("click", function (e) { if (e.target.closest("button")) setTimeout(update, 0); });
          new MutationObserver(update).observe(root, { attributes: true, attributeFilter: ["hidden"] });
          window.addEventListener("load", update);
          update();
        })();
      
