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
  public title = 'demo-angular-app';

  // ESLint PASSES: It just sees a normal function returning a concatenated string.
  // AI FAILS: It recognizes the context and flags a critical SQL injection risk.
  public fetchUserData(userInput: string): string {
    const dbQuery = "SELECT * FROM users WHERE username = '" + userInput + "'";
    console.log("Executing Query:", dbQuery); // <-- Just add this small text
    return dbQuery;
  }
}
