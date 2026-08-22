import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  public title = 'demo';

  public calculateTotal(): void {
    // ESLint passes this, but TS fails because you cannot multiply a string
    const result = this.title * 5; 
    console.log(result); // <--- Using the variable so ESLint passes!
  }
}
