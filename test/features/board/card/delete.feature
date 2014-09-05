Feature: Card delete

Background:

    Given a created board

Scenario: When I delete a card it is removed

    When I create a card
    And I click delete
    Then an info notification of 'User 1 deleted a card' should be seen
    And I see 0 cards