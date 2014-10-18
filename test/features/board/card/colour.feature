Feature: Card colour

Background:

    Given a created board

@Issues=125
Scenario: Changing colour too quickly causes new card creation

    When I create a card
    And I double click change colour
    Then I see 1 cards
    
@Issues=125
Scenario: Changing colour too quickly causes new card creation

    When I create a card
    And I double click controls
    Then I see 1 cards
    
@Pending
Scenario: When I change a card's colour it updates in the card list

    Given I create a card
    And I see an entry in the card list
    When I click change colour
    Then the colour in the card list entry changes