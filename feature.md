# 📌 Feature: Notification Bell

## 1. Overview
The Notification Bell provides users with quick, unobtrusive access to recent activity within the application. It is designed to maintain a minimalist experience while ensuring important updates are easily accessible.

## 2. Objectives
- **Accessibility**: Enable users to quickly view recent notifications.
- **Minimalism**: Reduce clutter by limiting visible notifications to the most relevant ones.
- **Connectivity**: Provide a seamless way to access the full notification history.
- **Real-time**: Keep the interface responsive by reflecting real-time updates.

---


logic will personalized for the users 
HR will be notified for:
- new user sign up
- report he approved
- report recived by team lead for approval
- employee status changed
- team created for a task
- Project created
- workspace delete
- project deleted


Team lead will be notified for:
- Any changes in project assigned to him
- Any changes in task assigned to him
- report approved
- waiting for report approval
- task assigned to him
- task deadline approaching 1 day left
- task deadline passed more than 1 day

Employee show him:
- Report approved
- waiting for report approval
- task assigned to him
- task deadline approaching 1 day left
- task deadline passed more than 1 day



## 3. User Experience (UX)

### 3.1 Default State
- The bell icon displays a prominent **unread notification count badge**.
- If there are no unread notifications, the badge is automatically hidden to maintain a clean interface.

### 3.2 Interaction
- On clicking the bell icon, a **dropdown/popup panel** appears.
- The panel displays the **5 most recent notifications**, ordered chronologically (newest first).

### 3.3 Overflow Handling
> [!NOTE]
> If total notifications exceed 5, a **“View All”** option is displayed at the bottom of the panel, redirecting the user to the dedicated **Notifications Page**.

### 3.4 Notification Actions
- Each notification includes a **“Mark as Read”** action.
- **Instant Feedback**: When triggered, the notification is removed from the list and the unread count updates instantly (optimistic update).
- **Persistence**: Changes are persisted to the database immediately to ensure consistency across sessions.

---

## 4. Functional Requirements
- [ ] **Fetch Logic**: Display the latest 5 notifications on demand.
- [ ] **State Management**: Maintain a dynamic count of unread notifications.
- [ ] **Read Actions**: Support "Mark as Read" with immediate UI removal.
- [ ] **Conditional Rendering**: Show/hide "View All" based on total count.
- [ ] **Navigation**: Redirect to the full Notifications Page.

---

## 5. Non-Functional Requirements

| Metric | Standard |
| :--- | :--- |
| **Performance** | Popup should open instantly (<200ms perceived delay). |
| **Scalability** | Must handle large volumes of notifications efficiently. |
| **Consistency** | UI state and backend data must remain synchronized. |
| **Responsiveness** | Smooth transitions across desktop and mobile devices. |

---

## 6. Edge Cases
- **Zero State**: If no notifications exist, show a friendly "No new notifications" message.
- **Connectivity**: Show a subtle loading indicator during slow network requests.
- **Error Handling**: Revert UI changes and notify the user if "Mark as Read" fails.
- **Throttling**: Prevent duplicate actions from rapid or accidental clicks.

## 7. Success Metrics
- 📈 **Engagement**: Increased interaction rate with the notification bell.
- ⚡ **Efficiency**: Reduced time to access important updates.
- ✅ **Reliability**: High success rate of "Mark as Read" actions without state errors.