Feature: Card actions

Background:

    Given a created board
    
Scenario: When I double click on the board a card is created

    When I create a card
    Then I see a card