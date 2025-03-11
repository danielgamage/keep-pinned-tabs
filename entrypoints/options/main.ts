import { MdInputChip } from '@material/web/chips/input-chip';
import { MdChipSet } from '@material/web/chips/chip-set';
import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field';
import { MdCheckbox } from '@material/web/checkbox/checkbox';
import { storage } from 'wxt/storage';
import type { Preferences } from '../types';

class OptionsPage {
  private chipSet: MdChipSet;
  private textField: MdOutlinedTextField;
  private checkbox: MdCheckbox;
  private form: HTMLFormElement;

  constructor() {
    this.chipSet = document.querySelector('md-chip-set')!;
    this.textField = document.querySelector('md-outlined-text-field')!;
    this.checkbox = document.querySelector('md-checkbox')!;
    this.form = document.querySelector('form')!;
    
    this.initialize();
  }

  private async initialize() {
    // Load saved data
    const preferences = await this.loadStoredData();
    this.renderChips(preferences.pinnedGroups ?? ['Favorites']);
    this.checkbox.checked = preferences.treatAllGroupsAsPinned ?? false;

    // Set up event listeners
    this.textField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addNewGroup();
      }
    });

    this.chipSet.addEventListener('remove', (e: Event) => {
      const chip = e.target as MdInputChip;
      this.removeGroup(chip.label);
    });

    this.checkbox.addEventListener('change', () => {
      this.updateTreatAllGroupsAsPinned();
    });

    this.form.addEventListener('reset', () => {
      this.resetAll();
    });
  }

  private async loadStoredData(): Promise<Preferences> {
    const data = await storage.getMeta('sync:preferences');
    return data.preferences ?? { pinnedGroups: ['Favorites'], treatAllGroupsAsPinned: false };
  }

  private async savePreferences(preferences: Partial<Preferences>) {
    const currentPrefs = await this.loadStoredData();
    await storage.setMeta("sync:preferences", { 
      preferences: { 
        ...currentPrefs, 
        ...preferences 
      } 
    });
  }

  private renderChips(groups: string[]) {
    this.chipSet.innerHTML = '';
    groups.forEach(group => {
      const chip = document.createElement('md-input-chip');
      chip.label = group;
      chip.removable = true;
      this.chipSet.appendChild(chip);
    });
  }

  private async addNewGroup() {
    const newGroup = this.textField.value.trim();
    if (!newGroup) return;

    const prefs = await this.loadStoredData();
    const currentGroups = prefs.pinnedGroups ?? ['Favorites'];
    
    if (!currentGroups.includes(newGroup)) {
      const newGroups = [...currentGroups, newGroup];
      await this.savePreferences({ pinnedGroups: newGroups });
      this.renderChips(newGroups);
    }
    
    this.textField.value = '';
  }

  private async removeGroup(groupName: string) {
    const prefs = await this.loadStoredData();
    const newGroups = (prefs.pinnedGroups ?? ['Favorites']).filter(g => g !== groupName);
    await this.savePreferences({ pinnedGroups: newGroups });
  }

  private async updateTreatAllGroupsAsPinned() {
    await this.savePreferences({ 
      treatAllGroupsAsPinned: this.checkbox.checked 
    });
  }

  private async resetAll() {
    const defaultPreferences: Preferences = {
      pinnedGroups: ['Favorites'],
      treatAllGroupsAsPinned: false
    };
    
    await this.savePreferences(defaultPreferences);
    this.renderChips(defaultPreferences.pinnedGroups);
    this.checkbox.checked = defaultPreferences.treatAllGroupsAsPinned;
    this.textField.value = '';
  }
}

// Initialize the options page
new OptionsPage();