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

  var User_Name = "Alice"; // Trigger: ESLint 'no var', camelcase naming rule
  let age = 30 // Trigger: Missing semicolon rule

  function getUserData(userId) {
    const unusedVar = true; // Trigger: 'no-unused-vars'

    if (userId == "123") { // Trigger: 'eqeqeq' (use '===' instead of '==')
      console.log("Found user"); // Trigger: 'no-console' warning
      return
    }
  }

  // Trigger for AI Reviewer: Unhandled division by zero & missing boundary check
  function calculateDiscount(totalAmount, userTier) {
    let discountRate = 0;

    if (userTier === 'VIP') {
      discountRate = 0.20;
    } else if (userTier === 'REGULAR') {
      discountRate = 0.10;
    }

    // Logic Bug 1: No check if totalAmount is negative or non-numeric
    // Logic Bug 2: Returns NaN if inputs are invalid without throwing an error
    const finalPrice = totalAmount - (totalAmount * discountRate);

    // Logic Bug 3: Potential division by zero if itemCount is 0
    const pricePerItem = function (itemCount) {
      return finalPrice / itemCount;
    };

    return finalPrice;
  }
}
