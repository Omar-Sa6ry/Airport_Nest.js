import * as DataLoader from 'dataloader'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { I18nService } from 'nestjs-i18n'
import { Gate } from '../entity/gate.model'
import { GateInput } from '../input/Gate.input'
import { Terminal } from 'src/modules/terminal/entity/terminal.model'

@Injectable()
export class GateLoader {
  private loader: DataLoader<string, GateInput>

  constructor (
    @InjectModel(Terminal) private terminalRepo: typeof Terminal,
    @InjectModel(Gate) private gateRepo: typeof Gate,
    private readonly i18n: I18nService,
  ) {
    this.loader = new DataLoader<string, GateInput>(async (keys: string[]) => {
      const gates = await this.gateRepo.findAll({
        where: { terminalId: { [Op.in]: keys } },
      })

      const terminalIds = [...new Set(gates.map(gate => gate.terminalId))]
      const terminals = await this.terminalRepo.findAll({
        where: { id: { [Op.in]: terminalIds } },
      })
      const terminalMap = new Map(
        terminals.map(terminal => [terminal.id, terminal]),
      )

      return keys.map(key => {
        const gate = gates.find(c => c.id === key)
        if (!gate) throw new NotFoundException(this.i18n.t('gate.NOT_FOUND'))

        const terminal = terminalMap.get(gate.terminalId)
        if (!terminal)
          throw new NotFoundException(this.i18n.t('terminal.NOT_FOUND'))

        return { ...gate.dataValues, terminal: terminal.dataValues }
      })
    })
  }

  load (id: string): Promise<GateInput> {
    return this.loader.load(id)
  }

  async loadMany (ids: string[]): Promise<GateInput[]> {
    const results = await this.loader.loadMany(ids)

    return results.filter(result => !(result instanceof Error)) as GateInput[]
  }
}
