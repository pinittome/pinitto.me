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
    
