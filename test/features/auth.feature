Feature: Authentication

Scenario: When I attempt to visit the board I am asked for a password

    Given I create a board with access passwords
    When I visit the board
    Then I am redirected to the authentication screen
    And I see the authentication elements
 
@Pending
Scenario: Can log in as [type]

    Given I create a board with access passwords
    When I visit the board
    And I am redirected to the authentication screen
    And I enter the password [password]
    Then I am redirected to the board

    Where:
        type  | title
        admin | admin
        write | write
        read  | read