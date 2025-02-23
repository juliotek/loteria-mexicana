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
  cartas: { imagen: string, texto: string }[] = [];
  cartasMezcladas: { imagen: string, texto: string }[] = [];
  cartaActual: { imagen: string, texto: string } | null = null;
  tablero: { imagen: string, texto: string }[][] = [];

  tamanosPDF = [
    { nombre: 'A4', width: 210, height: 297 },
    { nombre: 'Carta', width: 216, height: 279 },
    { nombre: 'Personalizado', width: 0, height: 0 }
  ];
  tamanoSeleccionado = this.tamanosPDF[0];

  anchoPersonalizado = 210;
  altoPersonalizado = 297;

  ngOnInit() {
    this.cargarCartasDesdeLocalStorage();
  }

  agregarCartas(event: any) {
    const archivos = event.target.files;
    if (archivos) {
      for (let archivo of archivos) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.cartas.push({ imagen: e.target.result, texto: 'Nueva carta' });
          this.guardarEnLocalStorage();
        };
        reader.readAsDataURL(archivo);
      }
    }
  }
  
  agregarCarta(event: any, texto: string) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const nuevaCarta = { imagen: e.target.result, texto };
        this.cartas.push(nuevaCarta);
        this.guardarEnLocalStorage();
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarCarta(index: number) {
    this.cartas.splice(index, 1);
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
    return [this.tamanoSeleccionado.width, this.tamanoSeleccionado.height];
  }

  generarPDF() {
    const [width, height] = this.obtenerTamanoPDF();
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [width, height]
    });

    let x = 10, y = 10, ancho = 40, alto = 60;
    this.cartas.forEach((carta, index) => {
      pdf.addImage(carta.imagen, 'JPEG', x, y, ancho, alto);
      pdf.text(carta.texto, x + 5, y + alto + 5);
      x += ancho + 10;
      if ((index + 1) % 4 === 0) {
        x = 10;
        y += alto + 20;
      }
    });
    pdf.save('loteria.pdf');
  }

  imprimirBaraja() {
    const [width, height] = this.obtenerTamanoPDF();
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [width, height]
    });

    let x = 10, y = 10, ancho = 50, alto = 75;
    let cartasPorFila = 3;
    let margen = 15;

    this.cartas.forEach((carta, index) => {
      pdf.addImage(carta.imagen, 'JPEG', x, y, ancho, alto);
      pdf.text(carta.texto, x + 15, y + alto + 5);

      x += ancho + margen;
      if ((index + 1) % cartasPorFila === 0) {
        x = 10;
        y += alto + margen;
      }

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