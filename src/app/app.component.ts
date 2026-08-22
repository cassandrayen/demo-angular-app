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
  title = 'demo-angular-app';

  public ngOnInit(): void {
    console.log(this.getAppVersion());
  }

  // ESLint PASSES: Clean syntax, single quotes, method is used, no linting violations.
  // AI FAILS: Declares return type 'number', but explicitly returns a 'string' (TS2322).
  public getAppVersion(): number {
    return 'v1.0.0';
  }
}
