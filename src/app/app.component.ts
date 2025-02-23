import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoteriaComponent } from './loteria/loteria.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoteriaComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'loteria-mexicana';
}
