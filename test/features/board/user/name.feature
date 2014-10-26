Feature: User name

Background:

    Given a created board

@pending
Scenario: Can change user's name

    When I open the user name modal
    And I change the user's name to 'This is my name'
    And I click the 'Set name' button
    And I open the 'User list' panel
    Then the user's name is updated
  
@Pending
Scenario: Notification is shown when user changes name

    When I open the user name modal
    
@Pending
Scenario: Incoming user name update

    When I open the user name modal
        
@Pending
Scenario: I can open the user name modal from the notification

    When I open the user name modal
    
@Pending
Scenario: If I have set my name then I don't see the user name notification

   When I open the user name modal

@pending
Scenario: Can cancel changing the user's name

    When I open the user name modal
    And I change the user's name to 'This is my name'
    And I close the user name modal
    And I open the 'User list' panel
    Then the user's name is not updated