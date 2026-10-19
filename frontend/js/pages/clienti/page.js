---
*** Begin Patch
*** Update File: frontend/js/pages/clienti/page.js
@@
-      const head = PT.barra({
-        nuovo: PT.azioni.nuovo,
-        demoClienti: PT.azioni.demoClienti,
-      });
+      // raccolgo anni disponibili tra tutti i clienti per il selettore
+      const anniOptions = Array.from(
+        new Set([].concat(...S.clienti.map((c) => c.anni || [])))
+      ).sort((a, b) => a - b);
+      const selectedYear = Number(localStorage.getItem('gb.clienti.year')) || null;
+      const head = PT.barra({
+        nuovo: PT.azioni.nuovo,
+        demoClienti: PT.azioni.demoClienti,
+        aggiungiAnno: PT.azioni.aggiungiAnnoATutti,
+        aggiungiAnnoSelezionati: PT.azioni.aggiungiAnnoSelezionati,
+        eliminaDatiSelezionati: PT.azioni.eliminaDatiSelezionati,
+        anniOptions,
+        selectedYear,
+        onYearChange: (y) => {
+          if (y) localStorage.setItem('gb.clienti.year', String(y));
+          else localStorage.removeItem('gb.clienti.year');
+          GB.clientiYear = y || null;
+          paintRows();
+        },
+      });
*** End Patch
