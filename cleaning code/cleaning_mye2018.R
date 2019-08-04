library(tidyverse)
library(readxl)
library(jsonlite)


mye_raw <- read_xlsx('../data/MYE18_AGE_BANDS.xlsx', sheet = 2)

mye_ni <- mye_raw %>% 
  filter(area_name == 'NORTHERN IRELAND') %>% 
  filter(gender != 'All persons') %>% 
  mutate(gender = if_else(gender == 'Females', 'F', 'M')) %>% 
  group_by(year, gender, age_5) %>% 
  summarise(count = sum(MYE))

nrow(mye_ni) == (19 * 2 * 48)

as.data.frame(mye_ni)


write(toJSON(mye_ni), '../data/mye_ni.json')

mye_ni_split <- split(mye_ni[2:4], mye_ni$year)

write(toJSON(mye_ni_split), '../data/mye_ni_split.json')

