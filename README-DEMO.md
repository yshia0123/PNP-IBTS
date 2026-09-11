# PNP IBTS — User Tutorial

Welcome! This guide walks you through the **Integrated Benefits Tracking
System (IBTS)** and shows you how to use each part of it. You don't need to
install anything — just open the link in your web browser and follow along.

> **Note:** This is a demonstration system. The accounts and data below are
> sample data for you to explore freely — go ahead and click around, add
> records, and try things out. Nothing here is real personnel information.

---

## Getting in

1. Open the site: **https://pnp-ibts.vercel.app**
2. You'll see a **sign-in page**. Log in using one of the sample accounts
   below. Each account represents a different type of user, and each sees the
   system differently.
3. To switch to a different account later, click **Sign out** (top-right), then
   log back in with another account.

### Sample accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | j.reyes@ibts.local | admin123 |
| **HR Manager** | a.cruz@ibts.local | hr123 |
| **Officer** | s.bautista@ibts.local | officer123 |
| **Retiree** | r.domingo@ibts.local | retiree123 |
| **Dependent** | m.cruz@ibts.local | dependent123 |

*(You'll also find this list on the sign-in page under "Demo accounts.")*

We suggest starting with the **Admin** account, since it can see everything,
then trying the others to see how the experience changes per role.

---

## 1. Signing in as the Admin

Log in with **j.reyes@ibts.local / admin123**. The Admin has full access to
every part of the system. Along the **left sidebar** you'll see all the
modules: Dashboard, Personnel, Claims, Retirees, Financial, Audit Log, and
Settings.

Take a moment to notice the top bar: a **search box** in the middle, a
**light/dark theme** toggle, a **notification bell**, your name, and the
**Sign out** button.

### Dashboard
This is your home screen. It shows a profile summary, a chart of service years,
a promotion history timeline, a summary of benefits, and an **Action Required**
feed of items needing attention.

> **Try it:** Click the **notification bell** at the top-right to see your
> alerts. You can mark them as read or dismiss them.

### Personnel
Click **Personnel** in the sidebar. This is the directory of all personnel
records, shown in a sortable, searchable table.

> **Try it — add an account:** Click **Add Account** (top-right). Choose a role
> (Officer, Retiree, or Dependent), fill in the details, and save. Your new
> record appears in the table right away. If you add a *Retiree*, switch to the
> **Retirees** module and you'll see them listed there too.

> **Try it — edit a record:** Click **Edit** on any row to update someone's
> rank, service years, or status, then save.

You can also **sort** columns by clicking the headers, and **filter** the list
by typing in the search box above the table.

### Claims
Click **Claims**. As an Admin you see *all* claims submitted across the
organization, and you can review and decide on them.

> **Try it — review a claim:** Find a claim marked **submitted** and click
> **Review**. Click **Start Review** (its status changes to *under review*),
> then **Proceed to Decision** and choose **Approve** or **Reject**. Each
> decision is recorded in the Audit Log.

### Financial
Click **Financial**. This gives you an overview of benefit commitments and
claim activity, shown as summary cards and charts.

> **Try it:** Click **Export CSV** to download a report of the figures.

### Audit Log
Click **Audit Log**. This is a read-only, timestamped record of important
actions in the system — new accounts, claim reviews, decisions, and so on.
After doing the steps above, check here to see your actions listed.

### Settings
Click **Settings** to update your profile (name, email, division), change your
password, and view your account details.

---

## 2. Signing in as the HR Manager

Sign out, then log in with **a.cruz@ibts.local / hr123**. The HR Manager is
very similar to the Admin — they can manage personnel and review/decide claims.

> **Notice the difference:** In the **Financial** and **Audit Log** modules, the
> HR Manager has a *read-only* view — for example, there's no **Export** button
> on the Financial page. This reflects the different level of access each role
> has.

---

## 3. Signing in as an Officer

Sign out, then log in with **s.bautista@ibts.local / officer123**. Officers
have a focused view — notice the sidebar shows fewer modules.

The Claims page is now titled **My Claims**, and it only shows *your own*
claims (an officer can't see other people's claims).

> **Try it — request a claim:** Click **New Claim Request**, choose one of your
> benefits, add a note if you like, and submit. You'll get a confirmation, and a
> notification appears in your bell. Now sign out and log back in as the **Admin**
> or **HR Manager** — your new request shows up in their full claims list,
> ready to be reviewed. This is how a real request would flow from an officer to
> an approver.

### Dependent
An Officer's family members may be listed as **dependents**. Adding and
verifying dependents is handled by the Admin (see the Personnel module) — the
Dependent themselves has a dedicated view, described next.

---

## 4. Signing in as a Retiree

Sign out, then log in with **r.domingo@ibts.local / retiree123**. A retiree's
dashboard is focused on retirement and pension benefits. Retirees can view the
Retirees directory and submit claims for their own benefits, just like an
officer.

---

## 5. Signing in as a Dependent

Sign out, then log in with **m.cruz@ibts.local / dependent123**. A dependent is
a family member (for example, a spouse) who is a beneficiary. Their view is the
simplest and focuses on **verification**.

The dashboard shows their **verification status**, the **documents** needed,
their **sponsor** (the officer they're linked to), and any **insurance
benefits** they're a beneficiary of.

> **Try it:** If the status isn't verified, click **Request Re-verification** to
> resubmit their documents. This sends a notification to the administrators.

---

## Helpful things to know

- **Switching roles:** Always **Sign out** first, then log in with a different
  account to experience the system as that role.
- **Search:** The search box at the top finds people and claims you have access
  to — try typing a name.
- **Notifications:** The bell shows your alerts; the number badge is your unread
  count.
- **Theme:** Use the **Light / Dark** button at the top to switch appearance.
- **Your changes are saved:** Anything you add or change (new accounts, claim
  decisions, submitted requests) is stored, so it will still be there when you
  come back or when another user logs in.

That's it — feel free to explore. Since this is a demonstration system with
sample data, you can't break anything, so try out every feature.
