Feature: Authentication

Scenario: When I attempt to visit the board I am asked for a password

    Given I create a board with access passwords
    When I visit the board
    Then I am redirected to the authentication screen
    And I see the authentication elements

Scenario: Can log in as [type]

    Given I create a board with access passwords
    When I visit the board
    And I am redirected to the authentication screen
    And I enter the password '[password]'
    And I click the 'Get me some access...' button
    Then I am redirected to the board
    And the board has the expected title
    And the user has the access level [title]

    Where:
        type  | title | password
        admin | admin | admin
        write | write | write
        read  | read  | read