import { MdInputChip } from '@material/web/chips/input-chip';
import { MdChipSet } from '@material/web/chips/chip-set';
import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field';
import { storage } from 'wxt/storage';
console.log("HI")
interface StorageData {
  pinnedGroups: string[];
}

class OptionsPage {
  private chipSet: MdChipSet;
  private textField: MdOutlinedTextField;
  private form: HTMLFormElement;

  constructor() {
    this.chipSet = document.querySelector('md-chip-set')!;
    this.textField = document.querySelector('md-outlined-text-field')!;
    this.form = document.querySelector('form')!;
    
    this.initialize();
  }

  private async initialize() {
    // Load saved data
    const data = await this.loadStoredData();
    this.renderChips(data.pinnedGroups);

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

    this.form.addEventListener('reset', () => {
      this.resetGroups();
    });
  }

  private async loadStoredData(): Promise<StorageData> {
    const data = await storage.getMeta('sync:preferences');
    return {
      pinnedGroups: data.pinnedGroups ?? ['Favorites']
    };
  }

  private async saveGroups(groups: string[]) {
    await storage.setMeta('sync:preferences', { pinnedGroups: groups });
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

    const data = await this.loadStoredData();
    if (!data.pinnedGroups.includes(newGroup)) {
      const newGroups = [...data.pinnedGroups, newGroup];
      await this.saveGroups(newGroups);
      this.renderChips(newGroups);
    }
    
    this.textField.value = '';
  }

  private async removeGroup(groupName: string) {
    const data = await this.loadStoredData();
    const newGroups = data.pinnedGroups.filter(g => g !== groupName);
    await this.saveGroups(newGroups);
  }

  private async resetGroups() {
    const defaultGroups = ['Favorites'];
    await this.saveGroups(defaultGroups);
    this.renderChips(defaultGroups);
    this.textField.value = '';
  }
}

// Initialize the options page
new OptionsPage();