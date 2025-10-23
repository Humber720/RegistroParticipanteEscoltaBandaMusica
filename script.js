document.addEventListener("DOMContentLoaded", () => {
  // ELEMENTOS DEL FORMULARIO
  const form = document.getElementById("studentForm");
  const sendButton = document.getElementById("sendList");
  const loading = document.getElementById("loading");
  const modal = document.getElementById("modal");
  const cerrarModal = document.getElementById("cerrar-modal");
  const descargarPDFBtn = document.getElementById("descargarPDF");

  const nombreInput = document.getElementById("nombre");
  const cursoSelect = document.getElementById("curso");
  const celularInput = document.getElementById("celular");
  const uniformeInput = document.getElementById("uniforme");

  // URL SheetBest
  const sheetURL = "https://api.sheetbest.com/sheets/158fec31-8afd-46a6-9805-0e32589787e2";

  // ================= PUBLICIDAD =================
  const pubContainer = document.querySelector(".publicidad");
  const pubImages = Array.from(pubContainer.querySelectorAll("img"));
  let currentIndex = 0;

  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = "&lt;";
  prevBtn.className = "pub-btn prev";
  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = "&gt;";
  nextBtn.className = "pub-btn next";

  pubContainer.appendChild(prevBtn);
  pubContainer.appendChild(nextBtn);

  function mostrarImagen(index) {
    pubImages.forEach((img, idx) => {
      img.classList.toggle("active", idx === index);
    });
  }

  function cambiarImagenAutomatica() {
    currentIndex = (currentIndex + 1) % pubImages.length;
    mostrarImagen(currentIndex);
  }

  let interval = setInterval(cambiarImagenAutomatica, 3000);

  prevBtn.addEventListener("click", () => {
    clearInterval(interval);
    currentIndex = (currentIndex - 1 + pubImages.length) % pubImages.length;
    mostrarImagen(currentIndex);
    interval = setInterval(cambiarImagenAutomatica, 3000);
  });

  nextBtn.addEventListener("click", () => {
    clearInterval(interval);
    currentIndex = (currentIndex + 1) % pubImages.length;
    mostrarImagen(currentIndex);
    interval = setInterval(cambiarImagenAutomatica, 3000);
  });

  mostrarImagen(currentIndex);

  // ================= FORMULARIO =================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    loading.style.display = "flex";
    sendButton.disabled = true;

    const nombre = nombreInput.value.trim();
    const curso = cursoSelect.value;
    const celular = celularInput.value.trim();
    const uniforme = uniformeInput.value.trim();

    // Fecha y hora automática
    const fecha = new Date();
    const fechaStr = `${fecha.getDate().toString().padStart(2,"0")}/${(fecha.getMonth()+1).toString().padStart(2,"0")}/${fecha.getFullYear()} ${fecha.getHours().toString().padStart(2,"0")}:${fecha.getMinutes().toString().padStart(2,"0")}`;

    const data = { nombre, curso, celular, uniforme, fechaHora: fechaStr };

    try {
      const response = await fetch(sheetURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error("Error al guardar en Google Sheets");

      // Mostrar modal y habilitar PDF
      modal.style.display = "flex";
      descargarPDFBtn.style.display = "inline-block";

    } catch (error) {
      alert("❌ Error al guardar los datos. Revisa la consola.");
      console.error(error);
    } finally {
      loading.style.display = "none";
      sendButton.disabled = false;
    }
  });

  // CERRAR MODAL
  cerrarModal.addEventListener("click", () => {
    modal.style.display = "none";
    form.reset();
  });

  // DESCARGAR PDF
  descargarPDFBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const nombre = nombreInput.value.trim();
    const curso = cursoSelect.value;
    const celular = celularInput.value.trim();
    const uniforme = uniformeInput.value.trim();

    const fecha = new Date();
    const fechaStr = `${fecha.getDate().toString().padStart(2,"0")}/${(fecha.getMonth()+1).toString().padStart(2,"0")}/${fecha.getFullYear()} ${fecha.getHours().toString().padStart(2,"0")}:${fecha.getMinutes().toString().padStart(2,"0")}`;

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.text("SE REGISTRÓ TU PARTICIPACIÓN", pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFont("times", "normal");
    doc.setFontSize(14);
    doc.text("Concurso de Banda - 5 de noviembre 2025", pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Fecha y hora: ${fechaStr}`, margin, y); y += 8;
    doc.text(`Nombre y Apellido: ${nombre}`, margin, y); y += 8;
    doc.text(`Curso: ${curso}`, margin, y); y += 8;
    doc.text(`Celular: ${celular}`, margin, y); y += 8;

    doc.text("Uniforme:", margin, y);
    y += 6;
    const uniformeLines = doc.splitTextToSize(uniforme, pageWidth - 2 * margin);
    uniformeLines.forEach(line => {
      doc.text(line, margin, y);
      y += 8;
    });

    y += 10;
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFont("times", "italic");
    doc.text("Gracias por registrar tu participación.", pageWidth / 2, y, { align: "center" });

    const filename = `participacion_${nombre.replace(/\s+/g,"_")}_${Date.now()}.pdf`;
    doc.save(filename);
  });
});
