Feature: Card actions

Background:

    Given a created board

Scenario: When creating a board the name popup appears

    Then an success notification of 'Hey! Did you know you can set your name by clicking "set name" in the settings menu, or click here... quick!' should be seen

Scenario: When I double click on the board a card is created

    When I create a card
    Then I see a card
    And I see the card elements

Scenario: When I delete a card it is removed

    When I create a card
    And I click delete
    Then an info notification of 'User 1 deleted a card' should be seen
    And I see 0 cards