import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import { FormsModule } from '@angular/forms';
import { CommonModule} from '@angular/common'

@Component({
  selector: 'app-loteria',
  imports: [FormsModule, CommonModule],
  templateUrl: './loteria.component.html',
  styleUrl: './loteria.component.css'
})
export class LoteriaComponent implements OnInit {
  cartas: { imagen: string, texto: string, numero: number }[] = [];
  cartasMezcladas: { imagen: string, texto: string }[] = [];
  cartaActual: { imagen: string, texto: string } | null = null;
  tablero: { imagen: string, texto: string }[][] = [];
  cartasJuego: { imagen: string, texto: string }[] = [];

  tamanosPDF = [
    { nombre: 'Carta', ancho: 215, alto: 279 },
    { nombre: 'A4', ancho: 210, alto: 297 },
    { nombre: 'A3', ancho: 297, alto: 420 }
  ];

  tamanoSeleccionado = this.tamanosPDF[0];

  anchoPersonalizado = 210;
  altoPersonalizado = 297;
  cantidadCartasJuego = 9;
  cantidadCartas = 1;

  fuentes = ['Arial', 'Verdana', 'Comic Sans MS', 'Times New Roman', 'Courier New'];
  fuenteSeleccionada = 'Arial';

  filasCarta = 4;
  columnasCarta = 4;
  margenCarta = 10;
  borderWeigth = 1;
  fontSize = 12;

  ngOnInit() {
    this.cargarCartasDesdeLocalStorage();
  }

  agregarCartas(event: any) {
    const archivos = event.target.files;
    if (archivos) {
      for (let archivo of archivos) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.cartas.push({ imagen: e.target.result, texto: 'Nueva', numero: this.cartas.length + 1 });
          this.guardarEnLocalStorage();
        };
        reader.readAsDataURL(archivo);
      }
    }
  }

  generarCartasJuego() {
    this.cartasJuego = this.cartas.slice(0, this.cantidadCartasJuego);
  }

  reordenarNumeros() {
    this.cartas.forEach((carta, index) => carta.numero = index + 1);
  }

  eliminarCarta(index: number) {
    this.cartas.splice(index, 1);
    this.reordenarNumeros();
    this.guardarEnLocalStorage();
  }

  vaciarCartas() {
    this.cartas = [];
    localStorage.removeItem('cartasLoteria');
  }

  mezclarCartas() {
    this.cartasMezcladas = [...this.cartas].sort(() => Math.random() - 0.5);
  }

  siguienteCarta() {
    if (this.cartasMezcladas.length > 0) {
      this.cartaActual = this.cartasMezcladas.shift() || null;
    } else {
      alert('No hay más cartas en el mazo.');
    }
  }

  generarTablero(tamano: number) {
    this.mezclarCartas();
    this.tablero = [];
    let index = 0;
    for (let i = 0; i < tamano; i++) {
      this.tablero.push([]);
      for (let j = 0; j < tamano; j++) {
        if (index < this.cartasMezcladas.length) {
          this.tablero[i].push(this.cartasMezcladas[index]);
          index++;
        }
      }
    }
  }

  obtenerTamanoPDF() {
    if (this.tamanoSeleccionado.nombre === 'Personalizado') {
      return [this.anchoPersonalizado, this.altoPersonalizado];
    }
    return [this.tamanoSeleccionado.ancho, this.tamanoSeleccionado.alto];
  }

  generarPDF() {
    if (this.cartas.length < 16) {
      alert("Debes subir al menos 16 imágenes para generar una lotería.");
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [this.tamanoSeleccionado.ancho, this.tamanoSeleccionado.alto]
    });

    const margen = this.margenCarta;
    const filas = this.filasCarta;
    const columnas = this.columnasCarta;
    const anchoCarta = (this.tamanoSeleccionado.ancho - 2 * margen) / columnas;
    const altoCarta = (this.tamanoSeleccionado.alto - 2 * margen) / filas;

    for (let i = 0; i < this.cantidadCartas; i++) {
      let cartasMezcladas = [...this.cartas].sort(() => Math.random() - 0.5).slice(0, (filas * columnas));

      let x = margen;
      let y = margen;
      let index = 0;

      for (let fila = 0; fila < filas; fila++) {
        for (let columna = 0; columna < columnas; columna++) {
          if (index >= cartasMezcladas.length) break;

          let carta = cartasMezcladas[index];

          // Agregar borde
          doc.setDrawColor(0); // Color negro
          doc.setLineWidth(this.borderWeigth);
          doc.rect(x, y, anchoCarta, altoCarta);

          // Agregar imagen (ajustada al espacio)
          doc.addImage(carta.imagen, 'JPEG', x + 2, y + 2, anchoCarta - 4, altoCarta - 20);

          // Agregar texto con la fuente seleccionada
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(this.fontSize);
          doc.text(carta.texto, x + anchoCarta / 2, y + altoCarta - 5, { align: 'center' });
          doc.text(`${carta.numero}`, x + 3, y + 8);

          x += anchoCarta;
          index++;
        }
        x = margen;
        y += altoCarta;
      }

      if (i < this.cantidadCartas - 1) {
        doc.addPage();
      }
    }

    doc.save('LoteriaMexicana.pdf');
  }

  imprimirBaraja() {
    const [width, height] = this.obtenerTamanoPDF();
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [width, height]
    });
  
    let x = 10, y = 10, ancho = 62, alto = 95;
    let cartasPorFila = 3;
    let margen = this.margenCarta;
  
    this.cartas.forEach((carta, index) => {
      // Dibujar borde
      pdf.setDrawColor(0); // Color negro
      pdf.setLineWidth(1);
      pdf.rect(x, y, ancho, alto);
  
      // Agregar imagen
      pdf.addImage(carta.imagen, 'JPEG', x + 2, y + 8, ancho - 4, alto - 20);
  
      // Agregar número en la esquina superior izquierda
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text(`${carta.numero}`, x + 3, y + 8);
  
      // Agregar texto debajo de la imagen
      pdf.setFontSize(this.fontSize);
      pdf.text(carta.texto, x + ancho / 2, y + alto - 5, { align: 'center' });
  
      x += ancho + margen;
      if ((index + 1) % cartasPorFila === 0) {
        x = 10;
        y += alto + margen;
      }
  
      // Si la siguiente fila no cabe en la página, agregar una nueva
      if (y + alto + margen > height - 20) {
        pdf.addPage();
        x = 10;
        y = 10;
      }
    });
  
    pdf.save('baraja_completa.pdf');
  }
  

  guardarEnLocalStorage() {
    localStorage.setItem('cartasLoteria', JSON.stringify(this.cartas));
  }

  cargarCartasDesdeLocalStorage() {
    const datos = localStorage.getItem('cartasLoteria');
    if (datos) {
      this.cartas = JSON.parse(datos);
    }
  }
}