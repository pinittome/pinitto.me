Feature: Board name

Background:

    Given a created board

Scenario: Can change the board name

    When I open the board title modal
    And I change the board title to 'This is my board'
    And I click the 'Set name' button
    Then the board title is updated
  
Scenario: Can change the board name

    When I open the board title modal
    And I change the board title to 'This is my board'
    And I click the 'Close' button
    Then the board title is not updated 
