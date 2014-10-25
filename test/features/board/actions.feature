Feature: Board name

Background:

    Given a created board

Scenario: Can change the board name

    When I open the board title modal
    And I change the board title to 'This is my board'
    And I click the 'Set board name' button
    Then the board title is updated
  
Scenario: Can cancel updating the board name

    When I open the board title modal
    And I change the board title to 'This is my board'
    And I click element '#close-set-board-name-modal'
    Then the board title is not updated
    
@Pending
Scenario: Notification is shown when board name updated

    When I open the board title modal
    
@Pending
Scenario: Incoming board name update

    When I open t board title modal
