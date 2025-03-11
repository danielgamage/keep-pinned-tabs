
export interface Preferences {
  /**
   * Whether to treat all tab groups as pinned
   */
  treatAllGroupsAsPinned?: boolean;

  /**
   * List of tab group names that should be treated as pinned
   * @default ['Favorites']
   */
  pinnedGroups?: string[];
}

export default {}
