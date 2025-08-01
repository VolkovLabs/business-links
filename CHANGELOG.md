# Changelog

All notable changes to the **Business Links** panel are documented in this file. This changelog follows the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - Unreleased

### Changed

- Use raw values for time range in URL ([Issue #59](https://github.com/VolkovLabs/business-links/issues/59)).
- Updated ESLint configuration ([#60](https://github.com/VolkovLabs/business-text/issues/60)).

## [2.1.0] - 2025-07-06

### Added

- **Custom AI Assistant Name**: Users can now personalize the name of their AI assistant. ([Issue #50](https://github.com/VolkovLabs/business-links/issues/50))
- **Temperature Option for LLM Models**: Introduced a new setting to adjust the temperature of language models for more tailored responses. ([Issue #51](https://github.com/VolkovLabs/business-links/issues/51))

### Changed

- **File Upload Feature**: Enhanced the file upload functionality in Business AI for a smoother user experience. ([Issue #51](https://github.com/VolkovLabs/business-links/issues/51))
- **Error Messaging**: Improved error messages in Business AI to provide clearer feedback. ([Issue #51](https://github.com/VolkovLabs/business-links/issues/51))

## [2.0.0] - 2025-06-27

We're excited to announce the release of version 2.0.0 of the Business Links plugin for Grafana. This update introduces new features, important breaking changes, and enhancements to improve your experience. Below are the details of what's new and improved.

### Breaking Changes

- **Minimum Grafana Version**: This release requires Grafana version **11.5** or higher. Please ensure your Grafana instance is updated before installing this version.

### Added

- **Kiosk Mode Support**: Added support for kiosk mode to enable a distraction-free, full-screen experience. ([#17](https://github.com/VolkovLabs/business-links/issues/17))
- **Hide Tooltip Option**: Introduced an option to hide tooltips for a cleaner interface. ([#42](https://github.com/VolkovLabs/business-links/issues/42))
- **LLM App Link Integration**: Added integration with LLM applications, allowing seamless linking to AI-powered tools. ([#45](https://github.com/VolkovLabs/business-links/issues/45))

### Changed

- **Sticky Positioning Recalculation**: Improved the recalculation of sticky positioning on window resize for better layout stability. ([#42](https://github.com/VolkovLabs/business-links/issues/42))
- **Dynamic Menu Font Size**: Updated the font size of dynamic menus to enhance readability and adaptability across devices. ([#42](https://github.com/VolkovLabs/business-links/issues/42))

## [1.4.0] - 2025-06-02

### Added

- Introduced the ability to customize the alignment of links, along with highlighting the currently selected dashboard for improved user experience. ([#34](https://github.com/VolkovLabs/business-links/issues/34))
- Added support for dynamic font sizing to enhance readability and adaptability across different devices and screen sizes. ([#39](https://github.com/VolkovLabs/business-links/pull/39))
- Implemented support for custom icons to allow users to personalize the visual representation of links and dashboards. ([#36](https://github.com/VolkovLabs/business-links/issues/36))

## [1.3.0] - 2025-05-28

### Added

- Added icons to the editor component for enhanced visual feedback ([#19](https://github.com/VolkovLabs/business-links/issues/19)).
- Introduced horizontal and vertical layout options for improved customization and flexibility ([#21](https://github.com/VolkovLabs/business-links/issues/21)).
- Added support for a Time-Picker input type to facilitate time-based interactions ([#23](https://github.com/VolkovLabs/business-links/issues/23)).
- Implemented an HTML delimiter type for better content formatting and separation ([#28](https://github.com/VolkovLabs/business-links/issues/28)).
- Added an option to highlight the current time picker for improved visibility and user experience ([#29](https://github.com/VolkovLabs/business-links/issues/29)).
- Introduced a button row type for dropdown menus to enhance user interaction and accessibility ([#30](https://github.com/VolkovLabs/business-links/issues/30)).
- Added a feature to freeze the panel on scroll for better usability in long dashboards ([#31](https://github.com/VolkovLabs/business-links/issues/31)).
- Implemented end-to-end (E2E) testing to ensure reliability and stability ([#35](https://github.com/VolkovLabs/business-links/issues/35)).

### Changed

- Upgraded to Grafana 12.0 with updated dependencies for improved compatibility and performance ([#24](https://github.com/VolkovLabs/business-links/issues/24)).

## [1.2.1] - 2025-04-29

### Changed

- Reverted the `swc/core` package to a previous version to resolve compatibility issues ([#15](https://github.com/VolkovLabs/business-links/issues/15)).

## [1.2.0] - 2025-04-27

### Added

- Added an option to specify the menu position for greater UI flexibility and customization ([#8](https://github.com/VolkovLabs/business-links/issues/8)).
- Included a community signature to acknowledge contributions and branding ([#10](https://github.com/VolkovLabs/business-links/issues/10)).

### Changed

- Upgraded to Grafana 11.6 with updated dependencies for enhanced stability and new features.

## [1.1.0] - 2025-04-22

### Added

- Added an option to sort tabs and prioritize selected tabs first for improved navigation ([#6](https://github.com/VolkovLabs/business-links/issues/6)).
- Introduced a feature to highlight the current dashboard or link for better user focus and clarity ([#4](https://github.com/VolkovLabs/business-links/issues/4)).
- Added support for displaying dropdown menus on hover instead of click for faster access and interaction ([#3](https://github.com/VolkovLabs/business-links/issues/3)).

## [1.0.0] - 2025-04-17

### Added

- Initial release of the Business Links panel, built using Volkov Labs templates for a robust and scalable foundation.
